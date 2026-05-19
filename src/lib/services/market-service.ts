// src/lib/services/market-service.ts
// Market Service — Orchestrate tất cả data sources

import type { MarketPrice, OHLCData, MarketOverview, VNStockPrice } from "@/types/market";
import { getCryptoMarkets } from "@/lib/api/coingecko";
import { getBinancePrices, getBinanceKlines } from "@/lib/api/binance";
import { getVNIndices, getVNStockOHLC, getTopVNStocks } from "@/lib/api/vndirect";
import { getGoldMarketPrices, getAllGoldPrices } from "@/lib/api/goldapi";

const CACHE = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string): T | null {
  const item = CACHE.get(key);
  if (item && item.expiry > Date.now()) return item.data as T;
  return null;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  CACHE.set(key, { data, expiry: Date.now() + ttlMs });
}

// Market Overview — tất cả thị trường
export async function getMarketOverview(): Promise<MarketOverview> {
  const cacheKey = "market_overview";
  const cached = getCached<MarketOverview>(cacheKey);
  if (cached) return { ...cached, updatedAt: Date.now() };

  const [vnData, cryptoData, goldData] = await Promise.allSettled([
    getVNIndices(),
    getCryptoWithFallback(),
    getGoldMarketPrices(),
  ]);

  const prices: MarketPrice[] = [
    ...(vnData.status === "fulfilled" ? vnData.value : getMockVNPrices()),
    ...(goldData.status === "fulfilled" ? goldData.value : getMockGoldPrices()),
    ...(cryptoData.status === "fulfilled" ? cryptoData.value : getMockCryptoPrices()),
  ];

  const overview: MarketOverview = { prices, updatedAt: Date.now() };
  setCache(cacheKey, overview, 30000); // 30s cache
  return overview;
}

// Crypto với fallback Binance
async function getCryptoWithFallback(): Promise<MarketPrice[]> {
  try {
    return await getCryptoMarkets(["BTC", "ETH", "XRP"]);
  } catch {
    console.warn("[MarketService] CoinGecko failed, using Binance");
    try {
      return await getBinancePrices(["BTC", "ETH", "XRP"]);
    } catch {
      return getMockCryptoPrices();
    }
  }
}

// OHLC data cho 1 symbol
export async function getSymbolOHLC(
  symbol: string,
  timeframe: string = "1d",
  limit: number = 90
): Promise<OHLCData[]> {
  const cacheKey = `ohlc_${symbol}_${timeframe}`;
  const cached = getCached<OHLCData[]>(cacheKey);
  if (cached) return cached;

  let data: OHLCData[] = [];

  if (["BTC", "ETH", "XRP", "BNB", "SOL"].includes(symbol)) {
    try {
      data = await getBinanceKlines(symbol, timeframe, limit);
    } catch {
      data = generateMockOHLC(symbol, limit);
    }
  } else {
    // VN stocks
    const resolution = timeframe === "1h" ? "60" : timeframe === "4h" ? "240" : "D";
    try {
      data = await getVNStockOHLC(symbol, resolution);
    } catch {
      data = generateMockOHLC(symbol, limit);
    }
  }

  setCache(cacheKey, data, 60000);
  return data;
}

// Top VN stocks
export async function getTopStocks(): Promise<VNStockPrice[]> {
  const cacheKey = "top_vn_stocks";
  const cached = getCached<VNStockPrice[]>(cacheKey);
  if (cached) return cached;

  try {
    const stocks = await getTopVNStocks();
    setCache(cacheKey, stocks, 60000);
    return stocks;
  } catch {
    return getMockVNStocks();
  }
}

// Gold prices
export async function getGoldPrices() {
  const cacheKey = "gold_prices";
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  try {
    const prices = await getAllGoldPrices();
    setCache(cacheKey, prices, 300000);
    return prices;
  } catch {
    return [];
  }
}

// Symbol info
export function getSymbolInfo(symbol: string) {
  const symbols: Record<string, any> = {
    VNINDEX: { displayName: "VN-Index", tradingviewSymbol: "HOSE:VNINDEX", marketType: "stock" },
    HNXINDEX: { displayName: "HNX-Index", tradingviewSymbol: "HNX:HNXINDEX", marketType: "stock" },
    VCB: { displayName: "Vietcombank", tradingviewSymbol: "HOSE:VCB", marketType: "stock" },
    HPG: { displayName: "Hòa Phát", tradingviewSymbol: "HOSE:HPG", marketType: "stock" },
    FPT: { displayName: "FPT Corp", tradingviewSymbol: "HOSE:FPT", marketType: "stock" },
    BTC: { displayName: "Bitcoin", tradingviewSymbol: "BINANCE:BTCUSDT", marketType: "crypto", coinGeckoId: "bitcoin" },
    ETH: { displayName: "Ethereum", tradingviewSymbol: "BINANCE:ETHUSDT", marketType: "crypto", coinGeckoId: "ethereum" },
    XRP: { displayName: "XRP", tradingviewSymbol: "BINANCE:XRPUSDT", marketType: "crypto", coinGeckoId: "ripple" },
    XAUUSD: { displayName: "XAU/USD", tradingviewSymbol: "TVC:GOLD", marketType: "gold" },
    SJC: { displayName: "Vàng SJC", tradingviewSymbol: "TVC:GOLD", marketType: "gold" },
  };
  return symbols[symbol] || null;
}

// Mock data
function getMockVNPrices(): MarketPrice[] {
  return [
    { symbol: "VNINDEX", displayName: "VN-Index", marketType: "stock", price: 1285.42, change: 12.35, changePercent: 0.97, source: "mock", timestamp: Date.now(), currency: "VND", sparkline: [1260,1265,1258,1272,1268,1275,1280,1285] },
    { symbol: "HNXINDEX", displayName: "HNX-Index", marketType: "stock", price: 238.15, change: -1.82, changePercent: -0.76, source: "mock", timestamp: Date.now(), currency: "VND", sparkline: [241,240,239,240,238,239,237,238] },
  ];
}

function getMockGoldPrices(): MarketPrice[] {
  return [
    { symbol: "SJC", displayName: "Vàng SJC", marketType: "gold", price: 110500000, change: 500000, changePercent: 0.45, source: "mock", timestamp: Date.now(), currency: "VND" },
    { symbol: "XAUUSD", displayName: "XAU/USD", marketType: "gold", price: 3342.80, change: 15.20, changePercent: 0.46, source: "mock", timestamp: Date.now(), currency: "USD" },
  ];
}

function getMockCryptoPrices(): MarketPrice[] {
  return [
    { symbol: "BTC", displayName: "Bitcoin", marketType: "crypto", price: 103420, change: -412.5, changePercent: -0.40, source: "mock", timestamp: Date.now(), currency: "USD", sparkline: [104200,103800,103600,103900,103700,103500,103400,103420] },
    { symbol: "ETH", displayName: "Ethereum", marketType: "crypto", price: 3892, change: 82.1, changePercent: 2.15, source: "mock", timestamp: Date.now(), currency: "USD", sparkline: [3750,3780,3800,3820,3850,3870,3885,3892] },
    { symbol: "XRP", displayName: "XRP", marketType: "crypto", price: 2.48, change: -0.03, changePercent: -1.20, source: "mock", timestamp: Date.now(), currency: "USD" },
  ];
}

function getMockVNStocks(): VNStockPrice[] {
  return [
    { symbol: "VCB", name: "Vietcombank", price: 88500, change: 300, changePercent: 0.34, volume: 4200000, totalValue: 371700000000, high: 89000, low: 88000, open: 88200, exchange: "HOSE" },
    { symbol: "HPG", name: "Hòa Phát", price: 28900, change: 600, changePercent: 2.12, volume: 12500000, totalValue: 361250000000, high: 29100, low: 28300, open: 28300, exchange: "HOSE" },
    { symbol: "FPT", name: "FPT Corp", price: 142000, change: 4500, changePercent: 3.27, volume: 2800000, totalValue: 397600000000, high: 143000, low: 137500, open: 137500, exchange: "HOSE" },
  ];
}

function generateMockOHLC(symbol: string, limit: number): OHLCData[] {
  const data: OHLCData[] = [];
  let price = symbol === "BTC" ? 95000 : symbol === "ETH" ? 3500 : 1200;
  const now = Date.now();
  for (let i = limit; i >= 0; i--) {
    const change = (Math.random() - 0.47) * price * 0.02;
    const open = price;
    price += change;
    data.push({
      symbol, timeframe: "1d",
      time: now - i * 86400000,
      open, close: price,
      high: Math.max(open, price) * (1 + Math.random() * 0.01),
      low: Math.min(open, price) * (1 - Math.random() * 0.01),
      volume: Math.floor(Math.random() * 1e9),
    });
  }
  return data;
}
