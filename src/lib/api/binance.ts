// src/lib/api/binance.ts
// Binance API — Fallback cho crypto prices + Klines

import type { MarketPrice, OHLCData } from "@/types/market";

const BASE = "https://api.binance.com/api/v3";

const SYMBOL_MAP: Record<string, string> = {
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
  XRP: "XRPUSDT",
  BNB: "BNBUSDT",
  SOL: "SOLUSDT",
  ADA: "ADAUSDT",
};

const DISPLAY_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  XRP: "XRP",
  BNB: "BNB",
  SOL: "Solana",
  ADA: "Cardano",
};

async function fetchBinance(endpoint: string, params?: Record<string, string>): Promise<any> {
  const url = new URL(`${BASE}${endpoint}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 30 },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Lấy giá 24h ticker nhiều symbol
export async function getBinancePrices(
  symbols: string[] = ["BTC", "ETH", "XRP"]
): Promise<MarketPrice[]> {
  const binanceSymbols = symbols
    .map(s => SYMBOL_MAP[s])
    .filter(Boolean);

  try {
    const data = await fetchBinance("/ticker/24hr", {
      symbols: JSON.stringify(binanceSymbols),
    });

    return (Array.isArray(data) ? data : [data]).map((item: any) => {
      const sym = Object.entries(SYMBOL_MAP).find(([, v]) => v === item.symbol)?.[0] || item.symbol;
      return {
        symbol: sym,
        displayName: DISPLAY_NAMES[sym] || sym,
        marketType: "crypto" as const,
        price: parseFloat(item.lastPrice),
        change: parseFloat(item.priceChange),
        changePercent: parseFloat(item.priceChangePercent),
        volume: parseFloat(item.quoteVolume),
        high: parseFloat(item.highPrice),
        low: parseFloat(item.lowPrice),
        open: parseFloat(item.openPrice),
        source: "binance",
        timestamp: Date.now(),
        currency: "USD" as const,
      };
    });
  } catch (err) {
    console.error("[Binance] Prices error:", err);
    throw err;
  }
}

// Klines (OHLCV) data
export async function getBinanceKlines(
  symbol: string,
  interval: string = "1d",
  limit: number = 100
): Promise<OHLCData[]> {
  const binanceSymbol = SYMBOL_MAP[symbol] || symbol;
  const binanceInterval = interval === "1d" ? "1d" : interval === "4h" ? "4h" : interval === "1h" ? "1h" : "1d";

  try {
    const data = await fetchBinance("/klines", {
      symbol: binanceSymbol,
      interval: binanceInterval,
      limit: limit.toString(),
    });

    return data.map((item: any[]) => ({
      symbol,
      timeframe: interval as any,
      time: item[0],
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    }));
  } catch (err) {
    console.error(`[Binance] Klines error for ${symbol}:`, err);
    throw err;
  }
}

// Single price
export async function getBinancePrice(symbol: string): Promise<number> {
  const binanceSymbol = SYMBOL_MAP[symbol] || symbol;
  try {
    const data = await fetchBinance("/ticker/price", { symbol: binanceSymbol });
    return parseFloat(data.price);
  } catch {
    throw new Error(`Failed to get Binance price for ${symbol}`);
  }
}

export { SYMBOL_MAP };
