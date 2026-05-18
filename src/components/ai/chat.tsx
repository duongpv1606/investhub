"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types";

const QUICK_PROMPTS = [
  { icon: "₿", title: "Bitcoin Outlook", prompt: "Analyze current Bitcoin market conditions and give me a short-term price outlook with key levels to watch." },
  { icon: "🤖", title: "Top AI Stocks", prompt: "What are the top 5 growth stocks in the AI sector right now? Give a brief analysis of each including risk level." },
  { icon: "📊", title: "Market Summary", prompt: "Summarize today's most important financial market events and what they mean for investors." },
  { icon: "💰", title: "Portfolio Tip", prompt: "For a balanced long-term portfolio, what's the ideal allocation between stocks, crypto, bonds, and cash in 2025?" },
  { icon: "🌍", title: "Macro View", prompt: "What are the top 3 macroeconomic risks investors should watch in the next 6 months?" },
  { icon: "🔥", title: "DeFi Update", prompt: "What are the most promising DeFi protocols right now and why are they gaining traction?" },
];

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI financial assistant powered by Claude.\n\nAsk me anything about stocks, crypto, market trends, portfolio strategy, or financial analysis. I'm here to help you make smarter investment decisions.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Sorry, I encountered an error. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Quick Prompts */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted px-1">Quick Prompts</h3>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.title}
            onClick={() => sendMessage(p.prompt)}
            disabled={loading}
            className="w-full text-left p-3 bg-card border border-border rounded-xl hover:border-accent/50 hover:bg-card-hover transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{p.icon}</span>
              <span className="text-sm font-medium text-white group-hover:text-accent transition-colors">{p.title}</span>
            </div>
            <p className="text-xs text-muted line-clamp-2">{p.prompt.slice(0, 60)}...</p>
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-3 flex flex-col bg-card border border-border rounded-xl overflow-hidden" style={{ height: "600px" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card-hover">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Financial Assistant</p>
              <p className="text-xs text-muted">Powered by Claude</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMessages([messages[0]])}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === "user" ? "bg-primary/20" : "bg-accent/20"
                }`}>
                  {msg.role === "user"
                    ? <User className="w-4 h-4 text-primary" />
                    : <Bot className="w-4 h-4 text-accent" />
                  }
                </div>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary/10 text-white border border-primary/20"
                    : "bg-card-hover border border-border text-white"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="bg-card-hover border border-border rounded-xl px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask about markets, stocks, crypto... (Enter to send)"
              rows={1}
              className="flex-1 bg-card-hover border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted resize-none focus:outline-none focus:border-accent transition-colors"
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="self-end"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted mt-2 text-center">
            AI responses are for informational purposes only — not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
