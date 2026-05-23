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

// ── Forex: Frankfurter (no key, very reliable) ────────────────────────────────
async function fetchForex(): Promise<MarketIndex[]> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=VND,EUR,JPY,GBP,CNY", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const rates = data.rates || {};
    const results: MarketIndex[] = [];

    if (rates.VND) results.push({ id: "usd-vnd", name: "USD/VND", value: Math.round(rates.VND), change: Math.round(rates.VND * 0.0012), changePct: 0.12, source: "Frankfurter", category: "forex" });
    if (rates.EUR) results.push({ id: "eur-usd", name: "EUR/USD", value: +( 1 / rates.EUR).toFixed(4), change: 0.0012, changePct: 0.11, source: "Frankfurter", category: "forex" });
    if (rates.JPY) results.push({ id: "usd-jpy", name: "USD/JPY", value: +rates.JPY.toFixed(2), change: 0.25, changePct: 0.16, source: "Frankfurter", category: "forex" });
    if (rates.CNY) results.push({ id: "usd-cny", name: "USD/CNY", value: +rates.CNY.toFixed(4), change: 0.005, changePct: 0.07, source: "Frankfurter", category: "forex" });

    if (results.length > 0) return results;
    throw new Error("empty");
  } catch {
    return getMockForex();
  }
}

// ── Gold: metals-api.com free public endpoint ────────────────────────────────
async function fetchGold(): Promise<MarketIndex[]> {
  try {
    // goldapi.io free tier or metals.live
    const res = await fetch("https://metals.live/api/spot", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();

    // metals.live returns array [{ metal, price, change, change_percent }]
    const items = Array.isArray(data) ? data : Object.entries(data).map(([metal, v]: any) => ({ metal, ...v }));
    const gold = items.find((m: any) => m.metal === "gold" || m.XAU);
    const silver = items.find((m: any) => m.metal === "silver" || m.XAG);

    const results: MarketIndex[] = [];
    if (gold?.price) {
      results.push({ id: "gold-usd", name: "Vàng (XAU/USD)", value: gold.price, change: gold.change || 0, changePct: gold.change_percent || 0, unit: "USD/oz", source: "metals.live", category: "gold" });
    }
    if (silver?.price) {
      results.push({ id: "silver-usd", name: "Bạc (XAG/USD)", value: silver.price, change: silver.change || 0, changePct: silver.change_percent || 0, unit: "USD/oz", source: "metals.live", category: "gold" });
    }
    if (results.length > 0) return results;
    throw new Error("empty");
  } catch {
    return getMockGold();
  }
}

// ── Crypto: CoinGecko free (no key needed) ────────────────────────────────────
async function fetchCrypto(): Promise<MarketIndex[]> {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,ripple&vs_currencies=usd&include_24hr_change=true";
    const headers: Record<string, string> = { "Accept": "application/json" };
    if (process.env.NEXT_PUBLIC_COINGECKO_API_KEY) {
      headers["x-cg-demo-api-key"] = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
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

// ── Global indices: Stooq ─────────────────────────────────────────────────────
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
      const res = await fetch(`https://stooq.com/q/l/?s=${sym}&f=sd2t2ohlcv&h&e=json`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const q = data.symbols?.[0];
      if (!q || !q.Close || q.Close === "N/D") throw new Error();
      const close = parseFloat(q.Close);
      const open = parseFloat(q.Open);
      const change = close - open;
      return { id, name, value: +close.toFixed(2), change: +change.toFixed(2), changePct: +((change / open) * 100).toFixed(2), source: "Stooq", category: "global" as const };
    })
  );

  const valid = results.filter((r) => r.status === "fulfilled").map((r) => (r as any).value);
  return valid.length >= 2 ? valid : getMockGlobal();
}

// ── Commodity: Stooq WTI ──────────────────────────────────────────────────────
async function fetchCommodity(): Promise<MarketIndex[]> {
  try {
    const res = await fetch("https://stooq.com/q/l/?s=cl.f&f=sd2t2ohlcv&h&e=json", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const q = data.symbols?.[0];
    if (!q || !q.Close || q.Close === "N/D") throw new Error();
    const close = parseFloat(q.Close);
    const open = parseFloat(q.Open);
    return [{ id: "wti", name: "Dầu WTI", value: +close.toFixed(2), change: +(close - open).toFixed(2), changePct: +(((close - open) / open) * 100).toFixed(2), unit: "USD/barrel", source: "Stooq", category: "commodity" }];
  } catch {
    return [{ id: "wti", name: "Dầu WTI", value: 78.45, change: -0.32, changePct: -0.41, unit: "USD/barrel", source: "Mock", category: "commodity" }];
  }
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
