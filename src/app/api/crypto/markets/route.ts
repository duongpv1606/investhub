import { NextRequest, NextResponse } from "next/server";
import { getCryptoMarkets } from "@/lib/market-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "50");
    const data = await getCryptoMarkets(page, perPage);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 });
  }
}
