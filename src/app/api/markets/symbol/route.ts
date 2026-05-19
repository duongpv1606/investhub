// src/app/api/markets/symbol/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSymbolOHLC, getSymbolInfo } from "@/lib/services/market-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase();
  const timeframe = req.nextUrl.searchParams.get("tf") || "1d";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "90");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  try {
    const [ohlc, info] = await Promise.allSettled([
      getSymbolOHLC(symbol, timeframe, limit),
      Promise.resolve(getSymbolInfo(symbol)),
    ]);

    return NextResponse.json({
      symbol,
      info: info.status === "fulfilled" ? info.value : null,
      ohlc: ohlc.status === "fulfilled" ? ohlc.value : [],
      timeframe,
    }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch symbol data" }, { status: 500 });
  }
}
