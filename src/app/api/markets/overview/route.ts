// src/app/api/markets/overview/route.ts
import { NextResponse } from "next/server";
import { getMarketOverview } from "@/lib/services/market-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getMarketOverview();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[API] Market overview error:", err);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
