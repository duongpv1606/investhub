// src/app/api/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getLatestNews, getMarketNews, searchNews } from "@/lib/services/news-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get("market") as "stock" | "gold" | "crypto" | null;
  const search = req.nextUrl.searchParams.get("q");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  try {
    let news;
    if (search) {
      news = await searchNews(search, limit);
    } else if (market && ["stock", "gold", "crypto"].includes(market)) {
      news = await getMarketNews(market, limit);
    } else {
      news = await getLatestNews(limit);
    }

    return NextResponse.json(news, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
