// src/app/api/market/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MOCK_NEWS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || "all";

  try {
    const news = await fetchAllNews();
    const filtered = category === "all"
      ? news
      : news.filter(n => n.category === category);

    return NextResponse.json(filtered, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    const filtered = category === "all" ? MOCK_NEWS : MOCK_NEWS.filter(n => n.category === category);
    return NextResponse.json(filtered);
  }
}

async function fetchAllNews() {
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;
  if (!apiKey) return MOCK_NEWS;

  try {
    const res = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=latest&limit=30`,
      { next: { revalidate: 300 }, headers: { authorization: `Apikey ${apiKey}` } }
    );
    if (!res.ok) return MOCK_NEWS;
    const data = await res.json();

    const cryptoNews = (data.Data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      excerpt: item.body?.slice(0, 200) + "...",
      url: item.url,
      imageUrl: item.imageurl,
      source: item.source_info?.name || item.source,
      category: "crypto" as const,
      tags: item.categories?.split("|").slice(0, 3) || [],
      publishedAt: item.published_on * 1000,
      readTime: 3,
    }));

    return [...MOCK_NEWS.filter(n => n.category !== "crypto"), ...cryptoNews];
  } catch {
    return MOCK_NEWS;
  }
}
