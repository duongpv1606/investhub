import { NextResponse } from "next/server";

/**
 * Gold API — giá vàng thật
 * - XAU/USD thế giới: CoinGecko pax-gold (ưu tiên, chạy trên Vercel) — fallback Binance PAXGUSDT
 * - USD/VND: open.er-api.com
 * - Giá SJC/nhẫn trong nước: quy đổi từ XAU/USD × USD-VND (ước tính, 1 lượng = 37.5g)
 *   kèm spread thực tế. Có nhãn "tính toán" để phân biệt với giá niêm yết.
 */

export const revalidate = 300;

interface GoldRow {
  name: string;
  buyPrice: number;
  sellPrice: number;
  changePercent: number;
  currency: "VND" | "USD";
  source: string;
}

const OZ_TO_LUONG = 37.5 / 31.1035; // 1 lượng = 37.5g, 1 oz = 31.1035g

async function fetchXAU(): Promise<{ price: number; changePct: number } | null> {
  // Ưu tiên CoinGecko pax-gold: chạy được trên Vercel (US region).
  // Binance bị chặn IP Mỹ (HTTP 451) nên chỉ dùng làm fallback.
  const cg = await fetchXAUCoinGecko();
  if (cg) return cg;
  return fetchXAUBinance();
}

async function fetchXAUCoinGecko(): Promise<{ price: number; changePct: number } | null> {
  try {
    const headers: Record<string, string> = { Accept: "application/json", "User-Agent": "InvestHub/1.0" };
    const cgKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    if (cgKey && !cgKey.startsWith("your_")) headers["x-cg-demo-api-key"] = cgKey;

    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_change=true",
      { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error();
    const d = await res.json();
    const price = d?.["pax-gold"]?.usd;
    if (!price || Number.isNaN(price)) return null;
    return { price, changePct: d["pax-gold"].usd_24h_change ?? 0 };
  } catch {
    return null;
  }
}

async function fetchXAUBinance(): Promise<{ price: number; changePct: number } | null> {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const d = await res.json();
    const price = parseFloat(d.lastPrice);
    if (!price || Number.isNaN(price)) return null;
    return { price, changePct: parseFloat(d.priceChangePercent) || 0 };
  } catch {
    return null;
  }
}

async function fetchUsdVnd(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error();
    const d = await res.json();
    return d.rates?.VND || 26000;
  } catch {
    return 26000;
  }
}

export async function GET() {
  const [xau, usdVnd] = await Promise.all([fetchXAU(), fetchUsdVnd()]);

  if (!xau) {
    return NextResponse.json({ success: true, isMock: true, usdVnd, xauUsd: null, prices: getMockGold(), updatedAt: new Date().toISOString() });
  }

  const changePct = +xau.changePct.toFixed(2);
  // Giá trị 1 lượng vàng nguyên chất quy đổi (VND), làm tròn tới triệu
  const luongValue = xau.price * OZ_TO_LUONG * usdVnd;
  const sjcBase = Math.round(luongValue / 1e6) * 1e6;

  const prices: GoldRow[] = [
    { name: "Vàng SJC (Hà Nội)", buyPrice: sjcBase - 500000, sellPrice: sjcBase + 1500000, changePercent: changePct, currency: "VND", source: "calculated" },
    { name: "Vàng SJC (TP.HCM)", buyPrice: sjcBase - 500000, sellPrice: sjcBase + 1500000, changePercent: changePct, currency: "VND", source: "calculated" },
    { name: "Vàng nhẫn SJC 9999", buyPrice: sjcBase - 6500000, sellPrice: sjcBase - 5000000, changePercent: changePct, currency: "VND", source: "calculated" },
    { name: "Vàng DOJI 9999", buyPrice: sjcBase - 6700000, sellPrice: sjcBase - 5200000, changePercent: changePct, currency: "VND", source: "calculated" },
    { name: "XAU/USD (Thế giới)", buyPrice: +(xau.price - 2).toFixed(2), sellPrice: +(xau.price + 2).toFixed(2), changePercent: changePct, currency: "USD", source: "live" },
  ];

  return NextResponse.json({
    success: true,
    isMock: false,
    xauUsd: +xau.price.toFixed(2),
    usdVnd: Math.round(usdVnd),
    prices,
    updatedAt: new Date().toISOString(),
  });
}

function getMockGold(): GoldRow[] {
  return [
    { name: "Vàng SJC (Hà Nội)", buyPrice: 109500000, sellPrice: 110500000, changePercent: 0.45, currency: "VND", source: "mock" },
    { name: "Vàng SJC (TP.HCM)", buyPrice: 109500000, sellPrice: 110500000, changePercent: 0.45, currency: "VND", source: "mock" },
    { name: "Vàng nhẫn SJC 9999", buyPrice: 104000000, sellPrice: 105500000, changePercent: 0.29, currency: "VND", source: "mock" },
    { name: "Vàng DOJI 9999", buyPrice: 103800000, sellPrice: 105200000, changePercent: 0.19, currency: "VND", source: "mock" },
    { name: "XAU/USD (Thế giới)", buyPrice: 3340, sellPrice: 3345, changePercent: 0.46, currency: "USD", source: "mock" },
  ];
}
