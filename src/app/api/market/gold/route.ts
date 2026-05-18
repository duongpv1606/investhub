// src/app/api/market/gold/route.ts
import { NextResponse } from "next/server";
import { MOCK_GOLD_PRICES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [sjcData, xauData] = await Promise.allSettled([
      fetchSJC(),
      fetchXAUUSD(),
    ]);

    const prices = [...MOCK_GOLD_PRICES];

    if (xauData.status === "fulfilled" && xauData.value) {
      const xauIdx = prices.findIndex(p => p.currency === "USD");
      if (xauIdx >= 0) {
        prices[xauIdx] = {
          ...prices[xauIdx],
          buyPrice: xauData.value,
          sellPrice: xauData.value + 5,
        };
      }
    }

    return NextResponse.json(prices, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json(MOCK_GOLD_PRICES);
  }
}

async function fetchXAUUSD() {
  try {
    const res = await fetch("https://data-asg.goldprice.org/dbXRates/USD", {
      next: { revalidate: 300 },
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.items?.[0]?.xauPrice;
  } catch { return null; }
}

async function fetchSJC() {
  // SJC không có public API — dùng mock data
  return null;
}
