// src/lib/api/coingecko.ts
// CoinGecko API — Crypto prices, OHLC, trending

import type { MarketPrice, OHLCData } from "@/types/market";

const BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY;

const COIN_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  XRP: "ripple",
  BNB: "binancecoin",
  SOL: "solana",
  ADA: "cardano",
  AVAX: "avalanche-2",
  LINK: "chainlink",
};

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "MarketHub/1.0",
  };
  if (API_KEY) headers["x-cg-demo-api-key"] = API_KEY;

  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// Lấy giá nhiều coin cùng lúc
export async function getCryptoMarkets(
  symbols: string[] = ["BTC", "ETH", "XRP"]
): Promise<MarketPrice[]> {
  const ids = symbols
    .map(s => COIN_IDS[s as keyof typeof COIN_IDS])
    .filter(Boolean)
    .join(",");

  const params = new URLSearchParams({
    vs_currency: "usd",
    ids,
    order: "market_cap_desc",
    sparkline: "true",
    price_change_percentage: "24h",
  });

  try {
    const data = await fetchWithRetry(`${BASE}/coins/markets?${params}`);
    return data.map((coin: any): MarketPrice => ({
      symbol: coin.symbol.toUpperCase(),
      displayName: coin.name,
      marketType: "crypto",
      price: coin.current_price,
      change: coin.price_change_24h ?? 0,
      changePercent: coin.price_change_percentage_24h ?? 0,
      volume: coin.total_volume,
      high: coin.high_24h,
      low: coin.low_24h,
      marketCap: coin.market_cap,
      source: "coingecko",
      timestamp: Date.now(),
      currency: "USD",
      sparkline: coin.sparkline_in_7d?.price?.filter((_: any, i: number) => i % 6 === 0).slice(-20) ?? [],
    }));
  } catch (err) {
    console.error("[CoinGecko] Markets error:", err);
    throw err;
  }
}

// OHLC data cho 1 coin
export async function getCryptoOHLC(
  symbol: string,
  days: number = 30
): Promise<OHLCData[]> {
  const coinId = COIN_IDS[symbol as keyof typeof COIN_IDS];
  if (!coinId) throw new Error(`Unknown symbol: ${symbol}`);

  try {
    const data = await fetchWithRetry(
      `${BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    );
    return data.map((item: number[]) => ({
      symbol,
      timeframe: days <= 1 ? "1h" : days <= 7 ? "4h" : "1d",
      time: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0,
    }));
  } catch (err) {
    console.error(`[CoinGecko] OHLC error for ${symbol}:`, err);
    throw err;
  }
}

// Trending coins
export async function getTrendingCoins() {
  try {
    const data = await fetchWithRetry(`${BASE}/search/trending`);
    return data.coins?.slice(0, 6).map((item: any) => ({
      id: item.item.id,
      symbol: item.item.symbol.toUpperCase(),
      name: item.item.name,
      rank: item.item.market_cap_rank,
      image: item.item.large,
      priceChangePercent: item.item.data?.price_change_percentage_24h?.usd ?? 0,
    })) ?? [];
  } catch (err) {
    console.error("[CoinGecko] Trending error:", err);
    return [];
  }
}

// Fear & Greed Index
export async function getFearGreedIndex() {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=7", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return {
      value: parseInt(data.data[0].value),
      classification: data.data[0].value_classification,
      history: data.data.map((d: any) => ({
        value: parseInt(d.value),
        classification: d.value_classification,
        timestamp: parseInt(d.timestamp) * 1000,
      })),
    };
  } catch {
    return { value: 50, classification: "Neutral", history: [] };
  }
}

export { COIN_IDS };
