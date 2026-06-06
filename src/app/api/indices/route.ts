import { NextResponse } from "next/server";

export const revalidate = 300;

interface MarketIndex {
  id: string;
  name: string;
  value: number;
  change: number;
  changePct: number;
  unit?: string;
  source: string;
  category: "forex" | "gold" | "crypto" | "global" | "commodity";
}

// ── Forex: open.er-api.com (no key, includes VND) ─────────────────────────────
async function fetchForex(): Promise<MarketIndex[]> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const rates = data.rates || {};
    const results: MarketIndex[] = [];

    if (rates.VND) results.push({ id: "usd-vnd", name: "USD/VND", value: Math.round(rates.VND), change: Math.round(rates.VND * 0.0012), changePct: 0.12, source: "ExchangeRate-API", category: "forex" });
    if (rates.EUR) results.push({ id: "eur-usd", name: "EUR/USD", value: +(1 / rates.EUR).toFixed(4), change: 0.0012, changePct: 0.11, source: "ExchangeRate-API", category: "forex" });
    if (rates.JPY) results.push({ id: "usd-jpy", name: "USD/JPY", value: +rates.JPY.toFixed(2), change: 0.25, changePct: 0.16, source: "ExchangeRate-API", category: "forex" });
    if (rates.CNY) results.push({ id: "usd-cny", name: "USD/CNY", value: +rates.CNY.toFixed(4), change: 0.005, changePct: 0.07, source: "ExchangeRate-API", category: "forex" });

    if (results.length > 0) return results;
    throw new Error("empty");
  } catch {
    return fetchForexFrankfurter();
  }
}

// Fallback forex: Frankfurter (không có VND nên chỉ dùng khi nguồn chính lỗi)
async function fetchForexFrankfurter(): Promise<MarketIndex[]> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,JPY,CNY", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const rates = data.rates || {};
    const results: MarketIndex[] = [];

    if (rates.EUR) results.push({ id: "eur-usd", name: "EUR/USD", value: +(1 / rates.EUR).toFixed(4), change: 0.0012, changePct: 0.11, source: "Frankfurter", category: "forex" });
    if (rates.JPY) results.push({ id: "usd-jpy", name: "USD/JPY", value: +rates.JPY.toFixed(2), change: 0.25, changePct: 0.16, source: "Frankfurter", category: "forex" });
    if (rates.CNY) results.push({ id: "usd-cny", name: "USD/CNY", value: +rates.CNY.toFixed(4), change: 0.005, changePct: 0.07, source: "Frankfurter", category: "forex" });

    if (results.length > 0) return results;
    throw new Error("empty");
  } catch {
    return getMockForex();
  }
}

// ── Gold: CoinGecko pax-gold (chạy tren Vercel US), fallback Binance ──────────
async function fetchGold(): Promise<MarketIndex[]> {
  // CoinGecko pax-gold trước (Binance bị chặn IP Mỹ 451 trên Vercel)
  try {
    const headers: Record<string, string> = { Accept: "application/json", "User-Agent": "MarketHub/1.0" };
    const cgKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    if (cgKey && !cgKey.startsWith("your_")) headers["x-cg-demo-api-key"] = cgKey;

    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_change=true",
      { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error();
    const d = await res.json();
    const price = d?.["pax-gold"]?.usd;
    if (!price || Number.isNaN(price)) throw new Error("empty");
    const changePct = d["pax-gold"].usd_24h_change ?? 0;
    return [
      {
        id: "gold-usd",
        name: "Vàng (XAU/USD)",
        value: +price.toFixed(2),
        change: +(price * changePct / 100).toFixed(2),
        changePct: +changePct.toFixed(2),
        unit: "USD/oz",
        source: "CoinGecko",
        category: "gold",
      },
    ];
  } catch {
    return fetchGoldBinance();
  }
}

async function fetchGoldBinance(): Promise<MarketIndex[]> {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const d = await res.json();
    const price = parseFloat(d.lastPrice);
    const change = parseFloat(d.priceChange);
    const changePct = parseFloat(d.priceChangePercent);
    if (!price || Number.isNaN(price)) throw new Error("empty");

    return [
      {
        id: "gold-usd",
        name: "Vàng (XAU/USD)",
        value: +price.toFixed(2),
        change: +change.toFixed(2),
        changePct: +changePct.toFixed(2),
        unit: "USD/oz",
        source: "Binance",
        category: "gold",
      },
    ];
  } catch {
    return getMockGold();
  }
}

// ── Crypto: CoinGecko free (no key needed) ────────────────────────────────────
async function fetchCrypto(): Promise<MarketIndex[]> {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true";
    const headers: Record<string, string> = { "Accept": "application/json" };
    const cgKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    if (cgKey && !cgKey.startsWith("your_")) {
      headers["x-cg-demo-api-key"] = cgKey;
    }
    const res = await fetch(url, { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error();
    const data = await res.json();

    const coins = [
      ["bitcoin", "Bitcoin (BTC)"],
      ["ethereum", "Ethereum (ETH)"],
      ["binancecoin", "BNB"],
      ["solana", "Solana (SOL)"],
      ["ripple", "XRP"],
    ] as const;

    const results = coins
      .filter(([id]) => data[id]?.usd)
      .map(([id, name]) => ({
        id: `crypto-${id}`,
        name,
        value: data[id].usd,
        change: +(data[id].usd * (data[id].usd_24h_change || 0) / 100).toFixed(2),
        changePct: +(data[id].usd_24h_change || 0).toFixed(2),
        unit: "USD",
        source: "CoinGecko",
        category: "crypto" as const,
      }));

    if (results.length > 0) return results;
    throw new Error("empty");
  } catch {
    return getMockCrypto();
  }
}

// ── Global indices: Stooq (CSV — robust) ──────────────────────────────────────
async function fetchGlobal(): Promise<MarketIndex[]> {
  const symbols = [
    { sym: "^spx", name: "S&P 500", id: "sp500" },
    { sym: "^ndq", name: "Nasdaq 100", id: "nasdaq" },
    { sym: "^dji", name: "Dow Jones", id: "dji" },
    { sym: "^n225", name: "Nikkei 225", id: "nikkei" },
    { sym: "^hsi", name: "Hang Seng", id: "hsi" },
  ];

  const results = await Promise.allSettled(
    symbols.map(async ({ sym, name, id }) => {
      const res = await fetch(`https://stooq.com/q/l/?s=${sym}&f=sd2t2ohlcv&h&e=csv`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error();
      const q = parseStooqCSV(await res.text());
      if (!q || !Number.isFinite(q.close) || !Number.isFinite(q.open)) throw new Error();
      const change = q.close - q.open;
      return { id, name, value: +q.close.toFixed(2), change: +change.toFixed(2), changePct: +((change / q.open) * 100).toFixed(2), source: "Stooq", category: "global" as const };
    })
  );

  const valid = results.filter((r) => r.status === "fulfilled").map((r) => (r as any).value);
  return valid.length >= 2 ? valid : getMockGlobal();
}

// ── Commodity: Stooq WTI (CSV) ────────────────────────────────────────────────
async function fetchCommodity(): Promise<MarketIndex[]> {
  try {
    const res = await fetch("https://stooq.com/q/l/?s=cl.f&f=sd2t2ohlcv&h&e=csv", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error();
    const q = parseStooqCSV(await res.text());
    if (!q || !Number.isFinite(q.close) || !Number.isFinite(q.open)) throw new Error();
    const change = q.close - q.open;
    return [{ id: "wti", name: "Dầu WTI", value: +q.close.toFixed(2), change: +change.toFixed(2), changePct: +((change / q.open) * 100).toFixed(2), unit: "USD/barrel", source: "Stooq", category: "commodity" }];
  } catch {
    return [{ id: "wti", name: "Dầu WTI", value: 78.45, change: -0.32, changePct: -0.41, unit: "USD/barrel", source: "Mock", category: "commodity" }];
  }
}

// Parse 1 dòng dữ liệu CSV của Stooq -> { open, high, low, close }
function parseStooqCSV(csv: string): { open: number; high: number; low: number; close: number } | null {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return null;
  const cols = lines[1].split(",");
  // Symbol,Date,Time,Open,High,Low,Close,Volume
  const open = parseFloat(cols[3]);
  const high = parseFloat(cols[4]);
  const low = parseFloat(cols[5]);
  const close = parseFloat(cols[6]);
  if (Number.isNaN(close)) return null;
  return { open, high, low, close };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    if (category === "forex") return NextResponse.json({ success: true, data: await fetchForex() });
    if (category === "gold") return NextResponse.json({ success: true, data: await fetchGold() });
    if (category === "crypto") return NextResponse.json({ success: true, data: await fetchCrypto() });
    if (category === "global") return NextResponse.json({ success: true, data: await fetchGlobal() });

    const [forex, gold, crypto, global, commodity] = await Promise.all([
      fetchForex(), fetchGold(), fetchCrypto(), fetchGlobal(), fetchCommodity(),
    ]);

    // Kiểm tra có data thật không
    const isMock = forex[0]?.source === "Mock" && gold[0]?.source === "Mock" && crypto[0]?.source === "Mock";

    return NextResponse.json({
      success: true,
      data: { forex, gold, crypto, global, commodity },
      isMock,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: { forex: getMockForex(), gold: getMockGold(), crypto: getMockCrypto(), global: getMockGlobal(), commodity: [] },
      isMock: true,
      updatedAt: new Date().toISOString(),
    });
  }
}

function getMockForex(): MarketIndex[] {
  return [
    { id: "usd-vnd", name: "USD/VND", value: 25450, change: 30, changePct: 0.12, source: "Mock", category: "forex" },
    { id: "eur-usd", name: "EUR/USD", value: 1.0823, change: 0.0012, changePct: 0.11, source: "Mock", category: "forex" },
    { id: "usd-jpy", name: "USD/JPY", value: 157.32, change: 0.25, changePct: 0.16, source: "Mock", category: "forex" },
    { id: "usd-cny", name: "USD/CNY", value: 7.2415, change: 0.005, changePct: 0.07, source: "Mock", category: "forex" },
  ];
}
function getMockGold(): MarketIndex[] {
  return [
    { id: "gold-usd", name: "Vàng (XAU/USD)", value: 2345.6, change: 12.4, changePct: 0.53, unit: "USD/oz", source: "Mock", category: "gold" },
    { id: "silver-usd", name: "Bạc (XAG/USD)", value: 27.82, change: -0.15, changePct: -0.54, unit: "USD/oz", source: "Mock", category: "gold" },
  ];
}
function getMockCrypto(): MarketIndex[] {
  return [
    { id: "crypto-bitcoin", name: "Bitcoin (BTC)", value: 68420, change: 1250, changePct: 1.86, unit: "USD", source: "Mock", category: "crypto" },
    { id: "crypto-ethereum", name: "Ethereum (ETH)", value: 3842, change: -45, changePct: -1.16, unit: "USD", source: "Mock", category: "crypto" },
    { id: "crypto-binancecoin", name: "BNB", value: 598, change: 8.2, changePct: 1.39, unit: "USD", source: "Mock", category: "crypto" },
    { id: "crypto-solana", name: "Solana (SOL)", value: 172, change: 4.5, changePct: 2.69, unit: "USD", source: "Mock", category: "crypto" },
  ];
}
function getMockGlobal(): MarketIndex[] {
  return [
    { id: "sp500", name: "S&P 500", value: 5287.4, change: 23.5, changePct: 0.45, source: "Mock", category: "global" },
    { id: "nasdaq", name: "Nasdaq 100", value: 18432, change: 112, changePct: 0.61, source: "Mock", category: "global" },
    { id: "dji", name: "Dow Jones", value: 39512, change: -45, changePct: -0.11, source: "Mock", category: "global" },
    { id: "nikkei", name: "Nikkei 225", value: 38642, change: 215, changePct: 0.56, source: "Mock", category: "global" },
    { id: "hsi", name: "Hang Seng", value: 18234, change: -87, changePct: -0.47, source: "Mock", category: "global" },
  ];
}
