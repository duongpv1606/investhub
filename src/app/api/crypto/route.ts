import { NextResponse } from "next/server";

/**
 * Crypto API — dữ liệu thật từ CoinGecko (markets) + Alternative.me (Fear & Greed)
 * Fallback sang Binance 24h ticker nếu CoinGecko lỗi, cuối cùng là mock.
 */

export const revalidate = 60;

interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  marketCap: number;
  volume: number;
  rank: number;
  icon: string;
  color: string;
}

const META: Record<string, { id: string; icon: string; color: string }> = {
  BTC: { id: "bitcoin", icon: "₿", color: "#f7931a" },
  ETH: { id: "ethereum", icon: "Ξ", color: "#627eea" },
  XRP: { id: "ripple", icon: "✕", color: "#00aae4" },
  SOL: { id: "solana", icon: "◎", color: "#9945ff" },
  BNB: { id: "binancecoin", icon: "B", color: "#f3ba2f" },
  ADA: { id: "cardano", icon: "₳", color: "#0033ad" },
};
const IDS = Object.values(META).map((m) => m.id).join(",");
const ID_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(META).map(([sym, m]) => [m.id, sym])
);

async function fetchCoinGecko(): Promise<CryptoAsset[]> {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${IDS}&order=market_cap_desc&price_change_percentage=24h`;
  const headers: Record<string, string> = { Accept: "application/json", "User-Agent": "InvestHub/1.0" };
  const cgKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  if (cgKey && !cgKey.startsWith("your_")) {
    headers["x-cg-demo-api-key"] = cgKey;
  }
  const res = await fetch(url, { headers, next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error("empty");

  return data.map((c: any, i: number) => {
    const sym = c.symbol.toUpperCase();
    const meta = META[sym] ?? { icon: "•", color: "#94A3B8" };
    return {
      symbol: sym,
      name: c.name,
      price: c.current_price,
      changePct: +(c.price_change_percentage_24h ?? 0).toFixed(2),
      marketCap: c.market_cap ?? 0,
      volume: c.total_volume ?? 0,
      rank: c.market_cap_rank ?? i + 1,
      icon: meta.icon,
      color: meta.color,
    };
  });
}

// Fallback: Binance 24h ticker (không có market cap)
async function fetchBinance(): Promise<CryptoAsset[]> {
  const map: Record<string, string> = { BTCUSDT: "BTC", ETHUSDT: "ETH", XRPUSDT: "XRP", SOLUSDT: "SOL", BNBUSDT: "BNB", ADAUSDT: "ADA" };
  const names: Record<string, string> = { BTC: "Bitcoin", ETH: "Ethereum", XRP: "XRP", SOL: "Solana", BNB: "BNB", ADA: "Cardano" };
  const symbols = JSON.stringify(Object.keys(map));
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error();
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((d: any, i: number) => {
    const sym = map[d.symbol] ?? d.symbol;
    const meta = META[sym] ?? { icon: "•", color: "#94A3B8" };
    return {
      symbol: sym,
      name: names[sym] ?? sym,
      price: parseFloat(d.lastPrice),
      changePct: +parseFloat(d.priceChangePercent).toFixed(2),
      marketCap: 0,
      volume: parseFloat(d.quoteVolume),
      rank: i + 1,
      icon: meta.icon,
      color: meta.color,
    };
  });
}

async function fetchFearGreed() {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=2", { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      value: parseInt(data.data[0].value),
      classification: data.data[0].value_classification,
      yesterday: data.data[1] ? parseInt(data.data[1].value) : null,
      yesterdayClass: data.data[1]?.value_classification ?? "",
    };
  } catch {
    return { value: 74, classification: "Greed", yesterday: 68, yesterdayClass: "Greed" };
  }
}

export async function GET() {
  let assets: CryptoAsset[] = [];
  let source = "coingecko";
  try {
    assets = await fetchCoinGecko();
  } catch {
    try {
      assets = await fetchBinance();
      source = "binance";
    } catch {
      assets = getMockCrypto();
      source = "mock";
    }
  }

  const fearGreed = await fetchFearGreed();

  return NextResponse.json({
    success: true,
    source,
    isMock: source === "mock",
    assets,
    fearGreed,
    updatedAt: new Date().toISOString(),
  });
}

function getMockCrypto(): CryptoAsset[] {
  return [
    { symbol: "BTC", name: "Bitcoin", price: 103420, changePct: -0.4, marketCap: 2040000000000, volume: 42100000000, rank: 1, icon: "₿", color: "#f7931a" },
    { symbol: "ETH", name: "Ethereum", price: 3892, changePct: 2.15, marketCap: 467000000000, volume: 18400000000, rank: 2, icon: "Ξ", color: "#627eea" },
    { symbol: "BNB", name: "BNB", price: 682, changePct: 1.4, marketCap: 99000000000, volume: 2100000000, rank: 3, icon: "B", color: "#f3ba2f" },
    { symbol: "XRP", name: "XRP", price: 2.48, changePct: -1.2, marketCap: 142000000000, volume: 6200000000, rank: 4, icon: "✕", color: "#00aae4" },
    { symbol: "SOL", name: "Solana", price: 198, changePct: 3.8, marketCap: 91000000000, volume: 4800000000, rank: 5, icon: "◎", color: "#9945ff" },
    { symbol: "ADA", name: "Cardano", price: 1.12, changePct: 0.6, marketCap: 39000000000, volume: 1100000000, rank: 6, icon: "₳", color: "#0033ad" },
  ];
}
