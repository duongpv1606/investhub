// src/lib/api/vndirect.ts
// VNDirect API — Chứng khoán Việt Nam

import type { MarketPrice, OHLCData, VNStockPrice } from "@/types/market";

const BASE = "https://dchart-api.vndirect.com.vn";
const FINFO_BASE = "https://finfo-api.vndirect.com.vn/v4";

const VN_INDICES = ["VNINDEX", "HNXINDEX", "UPCOMINDEX"];

async function fetchVNDirect(url: string): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        Origin: "https://www.vndirect.com.vn",
        Referer: "https://www.vndirect.com.vn/",
      },
      next: { revalidate: 30 },
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`VNDirect HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

// Lấy giá index VN
export async function getVNIndices(): Promise<MarketPrice[]> {
  try {
    const res = await fetch(
      `${FINFO_BASE}/stocks?q=type:STOCK,COVERED_WARRANT,ETF,INDEX&sort=matchVal:DESC&size=3&page=1&q=code:VNINDEX,HNXINDEX,UPCOMINDEX`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) throw new Error("VNDirect indices failed");
    const data = await res.json();

    if (data?.data?.length) {
      return data.data.map((item: any): MarketPrice => ({
        symbol: item.code,
        displayName: getIndexName(item.code),
        marketType: "stock",
        price: item.matchPrice || item.refPrice || 0,
        change: (item.matchPrice || 0) - (item.refPrice || 0),
        changePercent: item.refPrice > 0
          ? (((item.matchPrice || 0) - item.refPrice) / item.refPrice) * 100
          : 0,
        volume: item.matchQtty || 0,
        source: "vndirect",
        timestamp: Date.now(),
        currency: "VND",
      }));
    }
    throw new Error("No data from VNDirect");
  } catch (err) {
    console.warn("[VNDirect] Indices error, using TCBS fallback:", err);
    return getTCBSIndices();
  }
}

// TCBS fallback cho indices
async function getTCBSIndices(): Promise<MarketPrice[]> {
  try {
    const res = await fetch(
      "https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/second-tc-price?tickers=VNINDEX,HNXINDEX,UPCOMINDEX",
      {
        next: { revalidate: 30 },
        headers: { "User-Agent": "Mozilla/5.0" },
      }
    );
    if (!res.ok) throw new Error("TCBS failed");
    const data = await res.json();

    return (data?.data || []).map((item: any): MarketPrice => ({
      symbol: item.t,
      displayName: getIndexName(item.t),
      marketType: "stock",
      price: item.c || 0,
      change: (item.c || 0) - (item.r || 0),
      changePercent: item.r > 0 ? (((item.c || 0) - item.r) / item.r) * 100 : 0,
      volume: item.v || 0,
      source: "tcbs",
      timestamp: Date.now(),
      currency: "VND",
    }));
  } catch {
    return getMockVNIndices();
  }
}

// OHLC data từ VNDirect
export async function getVNStockOHLC(
  symbol: string,
  resolution: string = "D",
  from?: number,
  to?: number
): Promise<OHLCData[]> {
  const now = Math.floor(Date.now() / 1000);
  const fromTime = from || now - 365 * 24 * 3600;
  const toTime = to || now;

  try {
    const url = `${BASE}/dchart/history?symbol=${symbol}&resolution=${resolution}&from=${fromTime}&to=${toTime}`;
    const data = await fetchVNDirect(url);

    if (!data?.t?.length) throw new Error("No OHLC data");

    return data.t.map((time: number, i: number) => ({
      symbol,
      timeframe: resolution === "D" ? "1d" : resolution === "60" ? "1h" : "1d",
      time: time * 1000,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch (err) {
    console.error(`[VNDirect] OHLC error for ${symbol}:`, err);
    return getMockOHLC(symbol);
  }
}

// Top stocks
export async function getTopVNStocks(): Promise<VNStockPrice[]> {
  try {
    const symbols = ["VCB", "BID", "CTG", "VIC", "VHM", "HPG", "FPT", "TCB", "MBB", "VNM", "GAS", "MSN", "MWG", "VPB", "ACB"];
    const res = await fetch(
      `${FINFO_BASE}/stocks?q=code:${symbols.join(",")}&sort=marketCap:DESC&size=20`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("Top stocks failed");
    const data = await res.json();

    return (data?.data || []).map((item: any): VNStockPrice => ({
      symbol: item.code,
      name: item.companyName || item.code,
      price: item.matchPrice || item.refPrice || 0,
      change: (item.matchPrice || 0) - (item.refPrice || 0),
      changePercent: item.refPrice > 0
        ? (((item.matchPrice || 0) - item.refPrice) / item.refPrice) * 100 : 0,
      volume: item.matchQtty || 0,
      totalValue: item.matchVal || 0,
      high: item.ceiling || 0,
      low: item.floor || 0,
      open: item.refPrice || 0,
      exchange: item.exchange || "HOSE",
    }));
  } catch {
    return getMockTopStocks();
  }
}

function getIndexName(code: string): string {
  const names: Record<string, string> = {
    VNINDEX: "VN-Index",
    HNXINDEX: "HNX-Index",
    UPCOMINDEX: "UPCOM",
  };
  return names[code] || code;
}

// Mock data fallbacks
function getMockVNIndices(): MarketPrice[] {
  return [
    { symbol: "VNINDEX", displayName: "VN-Index", marketType: "stock", price: 1285.42, change: 12.35, changePercent: 0.97, volume: 18500000000, source: "mock", timestamp: Date.now(), currency: "VND", sparkline: [1260,1265,1258,1272,1268,1275,1280,1285] },
    { symbol: "HNXINDEX", displayName: "HNX-Index", marketType: "stock", price: 238.15, change: -1.82, changePercent: -0.76, volume: 2300000000, source: "mock", timestamp: Date.now(), currency: "VND", sparkline: [241,240,239,240,238,239,237,238] },
    { symbol: "UPCOMINDEX", displayName: "UPCOM", marketType: "stock", price: 95.28, change: 0.45, changePercent: 0.47, volume: 890000000, source: "mock", timestamp: Date.now(), currency: "VND" },
  ];
}

function getMockOHLC(symbol: string): OHLCData[] {
  const data: OHLCData[] = [];
  let price = 1200;
  const now = Date.now();
  for (let i = 90; i >= 0; i--) {
    price += (Math.random() - 0.47) * 15;
    data.push({
      symbol, timeframe: "1d",
      time: now - i * 86400000,
      open: price - Math.random() * 5,
      high: price + Math.random() * 10,
      low: price - Math.random() * 10,
      close: price,
      volume: Math.floor(Math.random() * 1e10),
    });
  }
  return data;
}

function getMockTopStocks(): VNStockPrice[] {
  return [
    { symbol: "VCB", name: "Vietcombank", price: 88500, change: 300, changePercent: 0.34, volume: 4200000, totalValue: 371700000000, high: 89000, low: 88000, open: 88200, exchange: "HOSE" },
    { symbol: "BID", name: "BIDV", price: 49200, change: -200, changePercent: -0.40, volume: 6800000, totalValue: 334560000000, high: 49500, low: 48900, open: 49400, exchange: "HOSE" },
    { symbol: "VIC", name: "Vingroup", price: 42500, change: 500, changePercent: 1.19, volume: 3100000, totalValue: 131750000000, high: 43000, low: 42000, open: 42000, exchange: "HOSE" },
    { symbol: "HPG", name: "Hòa Phát", price: 28900, change: 600, changePercent: 2.12, volume: 12500000, totalValue: 361250000000, high: 29100, low: 28300, open: 28300, exchange: "HOSE" },
    { symbol: "FPT", name: "FPT Corp", price: 142000, change: 4500, changePercent: 3.27, volume: 2800000, totalValue: 397600000000, high: 143000, low: 137500, open: 137500, exchange: "HOSE" },
    { symbol: "TCB", name: "Techcombank", price: 24100, change: 375, changePercent: 1.58, volume: 8900000, totalValue: 214490000000, high: 24200, low: 23725, open: 23725, exchange: "HOSE" },
    { symbol: "VNM", name: "Vinamilk", price: 72000, change: -300, changePercent: -0.41, volume: 1900000, totalValue: 136800000000, high: 72500, low: 71800, open: 72300, exchange: "HOSE" },
    { symbol: "MBB", name: "MB Bank", price: 21500, change: -100, changePercent: -0.46, volume: 15200000, totalValue: 326800000000, high: 21700, low: 21400, open: 21600, exchange: "HOSE" },
    { symbol: "GAS", name: "PV Gas", price: 82000, change: -500, changePercent: -0.61, volume: 890000, totalValue: 72980000000, high: 82500, low: 81500, open: 82500, exchange: "HOSE" },
    { symbol: "MSN", name: "Masan Group", price: 68900, change: 700, changePercent: 1.03, volume: 1200000, totalValue: 82680000000, high: 69200, low: 68200, open: 68200, exchange: "HOSE" },
  ];
}
