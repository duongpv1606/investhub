// src/app/api/cron/news/route.ts
// Vercel Cron Job — Chạy mỗi 5 phút để cập nhật tin tức

import { NextRequest, NextResponse } from "next/server";
import { getLatestNews } from "@/lib/services/news-service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const news = await getLatestNews(30);
    console.log(`[Cron] News updated: ${news.length} articles at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      articles: news.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Cron] News update failed:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
