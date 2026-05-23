import { NextResponse } from "next/server";

// SSI iBoard public API - no key required
const SSI_BASE = "https://iboard.ssi.com.vn/dchart/api";

// Fallback: VNDirect public endpoint
const VNDIRECT_BASE = "https://api.vndirect.com.vn/v4";

export const revalidate = 60; // cache 60s

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  exchange: "HOSE" | "HNX" | "UPCOM";
}

interface IndexData {
  name: string;
  value: number;
  change: number;
  changePct: number;
  volume: number;
  exchange: string;
}

// Fetch VN-Index, HNX-Index, UPCOM-Index from SSI
async function fetchIndices(): Promise<IndexData[]> {
  try {
    const res = await fetch(
      `${SSI_BASE}/1/data?lookupType=getIndexComponent&indexId=VNINDEX`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error("SSI index fetch failed");
    const data = await res.json();
    return data;
  } catch {
    // Try VNDirect fallback
    return fetchIndicesVNDirect();
  }
}

async function fetchIndicesVNDirect(): Promise<IndexData[]> {
  try {
    const res = await fetch(
      `${VNDIRECT_BASE}/indices?q=indexCode:VNINDEX,HNX-INDEX,UPCOM&size=3`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) throw new Error();
    const json = await res.json();
    const items = json.data || [];
    return items.map((i: any) => ({
      name: i.indexCode,
      value: i.indexValue,
      change: i.change,
      changePct: i.percentChange,
      volume: i.totalMatchVolume,
      exchange: i.indexCode,
    }));
  } catch {
    return getMockIndices();
  }
}

// Top stocks by market cap from VNDirect (public, no auth)
async function fetchTopStocks(exchange: string, size = 20): Promise<StockQuote[]> {
  try {
    const res = await fetch(
      `${VNDIRECT_BASE}/stocks?q=type:STOCK,exchange:${exchange}&sort=marketCap:desc&size=${size}`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) throw new Error();
    const json = await res.json();
    return (json.data || []).map((s: any) => ({
      symbol: s.code,
      price: s.matchPrice || s.referencePrice,
      change: s.priceChange,
      changePct: s.priceChangeRatio * 100,
      volume: s.matchVolume,
      high: s.highPrice,
      low: s.lowPrice,
      open: s.openPrice,
      exchange: exchange as "HOSE",
    }));
  } catch {
    return [];
  }
}

// OHLCV candle data for chart
async function fetchOHLCV(symbol: string, resolution = "D", from?: number, to?: number) {
  const now = Math.floor(Date.now() / 1000);
  const start = from || now - 90 * 86400; // 90 days default
  const end = to || now;

  try {
    const url = `${SSI_BASE}/1/chart?lookupType=history&symbol=${symbol}&resolution=${resolution}&from=${start}&to=${end}`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    // SSI returns { t, o, h, l, c, v }
    if (!data.t?.length) throw new Error("empty");
    return data.t.map((ts: number, i: number) => ({
      time: ts * 1000,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch {
    return getMockOHLCV(symbol);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overview";
  const symbol = searchParams.get("symbol") || "";
  const exchange = (searchParams.get("exchange") || "HOSE").toUpperCase();
  const resolution = searchParams.get("resolution") || "D";

  try {
    if (type === "overview") {
      const [hose, hnx] = await Promise.all([
        fetchTopStocks("HOSE", 15),
        fetchTopStocks("HNX", 10),
      ]);
      const indices = await fetchIndices();
      return NextResponse.json({
        success: true,
        indices,
        stocks: { HOSE: hose, HNX: hnx },
        updatedAt: new Date().toISOString(),
      });
    }

    if (type === "chart" && symbol) {
      const candles = await fetchOHLCV(symbol, resolution);
      return NextResponse.json({ success: true, symbol, candles });
    }

    if (type === "indices") {
      const indices = await fetchIndices();
      return NextResponse.json({ success: true, indices });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock data", fallback: true },
      { status: 500 }
    );
  }
}

// ── Mock fallbacks ──────────────────────────────────────────────────────────

function getMockIndices(): IndexData[] {
  return [
    { name: "VN-Index", value: 1287.45, change: 8.32, changePct: 0.65, volume: 612000000, exchange: "HOSE" },
    { name: "HNX-Index", value: 234.12, change: -1.45, changePct: -0.62, volume: 98000000, exchange: "HNX" },
    { name: "UPCOM", value: 92.67, change: 0.34, changePct: 0.37, volume: 42000000, exchange: "UPCOM" },
  ];
}

function getMockOHLCV(symbol: string) {
  const base = 50 + Math.random() * 150;
  const now = Date.now();
  return Array.from({ length: 90 }, (_, i) => {
    const drift = (Math.random() - 0.48) * 2;
    const open = base + drift * i;
    const close = open + (Math.random() - 0.48) * 3;
    return {
      time: now - (89 - i) * 86400000,
      open: +open.toFixed(2),
      high: +(Math.max(open, close) + Math.random() * 2).toFixed(2),
      low: +(Math.min(open, close) - Math.random() * 2).toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(500000 + Math.random() * 5000000),
    };
  });
}
