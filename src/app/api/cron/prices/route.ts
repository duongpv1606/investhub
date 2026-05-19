// src/app/api/cron/prices/route.ts
// Vercel Cron Job — Chạy mỗi 1 phút để cập nhật giá

import { NextRequest, NextResponse } from "next/server";
import { getMarketOverview } from "@/lib/services/market-service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const overview = await getMarketOverview();
    console.log(`[Cron] Prices updated: ${overview.prices.length} symbols at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      updated: overview.prices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Cron] Price update failed:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
