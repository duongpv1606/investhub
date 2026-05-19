// src/lib/api/goldapi.ts
// Gold prices — GoldAPI + SJC mock + XAU/USD

import type { GoldPrice, MarketPrice } from "@/types/market";

const GOLDAPI_KEY = process.env.GOLDAPI_API_KEY;

// XAU/USD từ GoldAPI
export async function getXAUUSD(): Promise<number | null> {
  if (!GOLDAPI_KEY) {
    // Fallback: dùng public goldprice API
    return getPublicGoldPrice();
  }

  try {
    const res = await fetch("https://www.goldapi.io/api/XAU/USD", {
      headers: {
        "x-access-token": GOLDAPI_KEY,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`GoldAPI HTTP ${res.status}`);
    const data = await res.json();
    return data.price;
  } catch (err) {
    console.warn("[GoldAPI] Error:", err);
    return getPublicGoldPrice();
  }
}

// Public gold price fallback
async function getPublicGoldPrice(): Promise<number | null> {
  try {
    const res = await fetch("https://data-asg.goldprice.org/dbXRates/USD", {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.items?.[0]?.xauPrice ?? null;
  } catch {
    return null;
  }
}

// Binance XAUUSDT fallback
async function getBinanceGold(): Promise<number | null> {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=XAUUSDT", {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return parseFloat(data.price);
  } catch {
    return null;
  }
}

// Tất cả giá vàng
export async function getAllGoldPrices(): Promise<GoldPrice[]> {
  const [xauUSD, binanceGold] = await Promise.allSettled([
    getXAUUSD(),
    getBinanceGold(),
  ]);

  const xauPrice = xauUSD.status === "fulfilled" ? xauUSD.value : null;
  const binancePrice = binanceGold.status === "fulfilled" ? binanceGold.value : null;
  const finalXAU = xauPrice || binancePrice || 3342.80;

  // VND price (1 troy oz = 31.1g, convert to VND)
  // 1 lượng = 37.5g, nên 1 lượng = (37.5/31.1035) * XAU_USD * USD_VND
  const USD_VND = 25450;
  const LUONG_OZ = 37.5 / 31.1035;
  const sjcBasePrice = Math.round(finalXAU * LUONG_VND_RATE(USD_VND) / 1e6) * 1e6;

  return [
    {
      name: "Vàng SJC (Hà Nội)",
      buyPrice: sjcBasePrice - 500000,
      sellPrice: sjcBasePrice + 500000,
      changePercent: 0.45,
      currency: "VND",
      source: "sjc-calculated",
      updatedAt: Date.now(),
    },
    {
      name: "Vàng SJC (TP.HCM)",
      buyPrice: sjcBasePrice - 500000,
      sellPrice: sjcBasePrice + 500000,
      changePercent: 0.45,
      currency: "VND",
      source: "sjc-calculated",
      updatedAt: Date.now(),
    },
    {
      name: "Vàng nhẫn SJC 9999",
      buyPrice: sjcBasePrice - 6500000,
      sellPrice: sjcBasePrice - 5000000,
      changePercent: 0.29,
      currency: "VND",
      source: "sjc-calculated",
      updatedAt: Date.now(),
    },
    {
      name: "Vàng DOJI 9999",
      buyPrice: sjcBasePrice - 6700000,
      sellPrice: sjcBasePrice - 5200000,
      changePercent: 0.22,
      currency: "VND",
      source: "doji-calculated",
      updatedAt: Date.now(),
    },
    {
      name: "XAU/USD (Thế giới)",
      buyPrice: finalXAU - 2,
      sellPrice: finalXAU + 2,
      changePercent: 0.46,
      currency: "USD",
      source: xauPrice ? "goldapi" : binancePrice ? "binance" : "mock",
      updatedAt: Date.now(),
    },
  ];
}

function LUONG_VND_RATE(usdVnd: number): number {
  const LUONG_TO_OZ = 37.5 / 31.1035;
  return LUONG_TO_OZ * usdVnd;
}

// MarketPrice format cho overview
export async function getGoldMarketPrices(): Promise<MarketPrice[]> {
  try {
    const [xauUSD] = await Promise.allSettled([getXAUUSD()]);
    const price = xauUSD.status === "fulfilled" ? xauUSD.value : 3342.80;
    const finalPrice = price || 3342.80;

    const USD_VND = 25450;
    const sjcPrice = Math.round(finalPrice * 37.5 / 31.1035 * USD_VND / 1e6) * 1e6 + 500000;

    return [
      {
        symbol: "SJC",
        displayName: "Vàng SJC",
        marketType: "gold",
        price: sjcPrice,
        change: 500000,
        changePercent: 0.45,
        source: "calculated",
        timestamp: Date.now(),
        currency: "VND",
        sparkline: generateGoldSparkline(sjcPrice),
      },
      {
        symbol: "XAUUSD",
        displayName: "XAU/USD",
        marketType: "gold",
        price: finalPrice,
        change: 15.20,
        changePercent: 0.46,
        source: "goldapi",
        timestamp: Date.now(),
        currency: "USD",
        sparkline: generateGoldSparkline(finalPrice),
      },
    ];
  } catch {
    return getMockGoldPrices();
  }
}

function generateGoldSparkline(basePrice: number): number[] {
  const data = [];
  let p = basePrice * 0.985;
  for (let i = 0; i < 10; i++) {
    p += (Math.random() - 0.47) * basePrice * 0.002;
    data.push(Math.round(p));
  }
  return data;
}

function getMockGoldPrices(): MarketPrice[] {
  return [
    { symbol: "SJC", displayName: "Vàng SJC", marketType: "gold", price: 110500000, change: 500000, changePercent: 0.45, source: "mock", timestamp: Date.now(), currency: "VND" },
    { symbol: "XAUUSD", displayName: "XAU/USD", marketType: "gold", price: 3342.80, change: 15.20, changePercent: 0.46, source: "mock", timestamp: Date.now(), currency: "USD" },
  ];
}
