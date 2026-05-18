import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert financial AI assistant embedded in InvestHub, a professional trading and investment platform.

Your expertise covers:
- Stock market analysis (technical and fundamental)
- Cryptocurrency market analysis
- Portfolio strategy and risk management
- Macroeconomic trends and their market impact
- Financial instruments (ETFs, options, bonds)
- DeFi and blockchain ecosystems
- Financial news interpretation

Guidelines:
- Be precise, data-driven, and actionable
- Use bullet points for lists of items
- Format numbers clearly ($1,234 or 4.5%)
- Keep responses concise (under 250 words unless depth is requested)
- Always mention risk level when discussing investments
- Never give specific "buy/sell" directives — frame as analysis
- End with a brief risk disclaimer when recommending assets

Tone: Professional but accessible. You're speaking to serious but not necessarily expert investors.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({ content: content.text });
  } catch (error) {
    console.error("[AI Chat Error]", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
