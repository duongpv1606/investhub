import { NextRequest, NextResponse } from "next/server";
import { getStockQuote } from "@/lib/market-data";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "Symbol required" }, { status: 400 });

  try {
    const data = await getStockQuote(symbol.toUpperCase());
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
