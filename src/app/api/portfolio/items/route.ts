import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json([]); }
export async function POST() { return NextResponse.json({ message: "Auth required" }, { status: 401 }); }