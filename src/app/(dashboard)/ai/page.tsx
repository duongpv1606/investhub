import type { Metadata } from "next";
import { AIChat } from "@/components/ai/chat";

export const metadata: Metadata = { title: "AI Financial Assistant" };

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">AI Financial Assistant</h1>
        <p className="text-muted text-sm mt-1">Powered by Claude — ask anything about markets, stocks, or crypto</p>
      </div>
      <AIChat />
    </div>
  );
}
