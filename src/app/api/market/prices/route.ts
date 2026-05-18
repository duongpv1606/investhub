// src/app/api/market/prices/route.ts
import { NextResponse } from "next/server";
import { MOCK_MARKET_PRICES } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function fetchVNIndex() {
  try {
    const res = await fetch(
      "https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/second-tc-price?tickers=VNINDEX,HNXINDEX",
      { next: { revalidate: 30 }, headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data;
  } catch { return null; }
}

async function fetchBinancePrices() {
  try {
    const symbols = ["BTCUSDT", "ETHUSDT", "XRPUSDT"];
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchGoldPrice() {
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

export async function GET() {
  try {
    const [vnData, binanceData, goldUSD] = await Promise.allSettled([
      fetchVNIndex(),
      fetchBinancePrices(),
      fetchGoldPrice(),
    ]);

    const prices = [...MOCK_MARKET_PRICES];

    // Update với data thật nếu có
    if (binanceData.status === "fulfilled" && binanceData.value) {
      const binance = binanceData.value as any[];
      binance.forEach((item: any) => {
        const idx = prices.findIndex(p => p.symbol === item.symbol);
        if (idx >= 0) {
          prices[idx] = {
            ...prices[idx],
            price: parseFloat(item.lastPrice),
            change: parseFloat(item.priceChange),
            changePercent: parseFloat(item.priceChangePercent),
            volume: parseFloat(item.quoteVolume),
          };
        }
      });
    }

    if (goldUSD.status === "fulfilled" && goldUSD.value) {
      const idx = prices.findIndex(p => p.symbol === "XAUUSD");
      if (idx >= 0) {
        prices[idx] = { ...prices[idx], price: goldUSD.value };
      }
    }

    return NextResponse.json(prices, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json(MOCK_MARKET_PRICES);
  }
}
