import { NextRequest, NextResponse } from "next/server";
import { getStockQuote } from "@/lib/market-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  try {
    const data = await getStockQuote(symbol.toUpperCase());
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}