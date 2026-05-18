import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

const AddItemSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  name: z.string().min(1),
  assetType: z.enum(["STOCK", "CRYPTO", "ETF", "FOREX"]),
  quantity: z.number().positive(),
  avgBuyPrice: z.number().positive(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await prisma.portfolio.findUnique({
    where: { userId: user.id },
    include: { items: true },
  });

  return NextResponse.json(portfolio?.items || []);
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = AddItemSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  let portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } });
  if (!portfolio) {
    portfolio = await prisma.portfolio.create({ data: { userId: user.id } });
  }

  const item = await prisma.portfolioItem.upsert({
    where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol: parsed.data.symbol } },
    update: { quantity: { increment: parsed.data.quantity }, avgBuyPrice: parsed.data.avgBuyPrice },
    create: { portfolioId: portfolio.id, ...parsed.data },
  });

  return NextResponse.json(item, { status: 201 });
}
