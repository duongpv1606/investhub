"use client";
import { useState, useEffect } from "react";
import { MOCK_NEWS, MOCK_VN_STOCKS } from "@/lib/utils";
import { TrendingUp, TrendingDown, Send, ExternalLink, Zap, Flame } from "lucide-react";

const SENTIMENT_CONFIG = {
  bullish: { label: "Bullish", color: "#00FFB2", bg: "rgba(0,255,178,0.1)" },
  bearish: { label: "Bearish", color: "#FF4D6D", bg: "rgba(255,77,109,0.1)" },
  neutral: { label: "Neutral", color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
};

const MARKET_TAG = {
  stock: { label: "VN Stocks", color: "#4D7CFE", bg: "rgba(77,124,254,0.12)" },
  crypto: { label: "Crypto", color: "#F7931A", bg: "rgba(247,147,26,0.12)" },
  gold: { label: "Gold", color: "#FFD166", bg: "rgba(255,209,102,0.12)" },
  macro: { label: "Macro", color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
};

function getSentiment(title: string): "bullish" | "bearish" | "neutral" {
  const bull = ["tăng", "tăng mạnh", "kỷ lục", "phục hồi", "mua ròng", "vượt", "bull", "rally", "surge"];
  const bear = ["giảm", "bán tháo", "sụt", "lao dốc", "sợ hãi", "bear", "drop", "fall", "loss"];
  const t = title.toLowerCase();
  if (bull.some(w => t.includes(w))) return "bullish";
  if (bear.some(w => t.includes(w))) return "bearish";
  return "neutral";
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}g`;
  if (m > 0) return `${m}p`;
  return "vừa xong";
}

export function NewsSidebar() {
  const [news, setNews] = useState<any[]>(MOCK_NEWS);
  const [activeSection, setActiveSection] = useState<"breaking" | "trending">("breaking");

  useEffect(() => {
    fetch("/api/news?limit=15")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setNews(d); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Breaking News */}
      <div style={{
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "12px 14px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {[
              { key: "breaking", label: "Tin nóng", icon: Flame },
              { key: "trending", label: "Trending", icon: Zap },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "600",
                  background: activeSection === tab.key ? "rgba(0,229,168,0.1)" : "transparent",
                  border: `1px solid ${activeSection === tab.key ? "rgba(0,229,168,0.2)" : "transparent"}`,
                  color: activeSection === tab.key ? "#00E5A8" : "#64748B",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                <tab.icon size={11} />
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF4D6D", animation: "pulse 1.5s ease infinite" }} />
        </div>

        {/* News list */}
        <div style={{ padding: "8px 4px", maxHeight: "420px", overflowY: "auto" }}>
          {news.slice(0, 8).map((article: any, i: number) => {
            const sentiment = getSentiment(article.title);
            const sConfig = SENTIMENT_CONFIG[sentiment];
            const mType = article.marketType || "stock";
            const mConfig = MARKET_TAG[mType as keyof typeof MARKET_TAG] || MARKET_TAG.stock;

            return (
              <a key={article.id || i}
                href={article.sourceUrl || article.url || "#"}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", gap: "10px", padding: "10px", borderRadius: "10px",
                  textDecoration: "none", transition: "all 0.15s", cursor: "pointer",
                  borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.03)" : "none",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>

                {/* Thumbnail */}
                <div style={{
                  width: "48px", height: "40px", borderRadius: "8px", flexShrink: 0,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px",
                }}>
                  {article.imageUrl
                    ? <img src={article.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    : mType === "crypto" ? "₿" : mType === "gold" ? "🥇" : "📈"
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Tags */}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", fontFamily: "monospace", fontWeight: "600", background: mConfig.bg, color: mConfig.color }}>
                      {mConfig.label}
                    </span>
                    <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", fontFamily: "monospace", fontWeight: "600", background: sConfig.bg, color: sConfig.color }}>
                      {sConfig.label}
                    </span>
                  </div>

                  {/* Title */}
                  <p style={{ fontSize: "12px", fontWeight: "500", color: "#CBD5E1", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
                    {article.title}
                  </p>

                  {/* Meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span style={{ fontSize: "10px", color: "#475569" }}>{article.sourceName || article.source}</span>
                    <span style={{ fontSize: "10px", color: "#334155" }}>·</span>
                    <span style={{ fontSize: "10px", color: "#475569", fontFamily: "monospace" }}>{timeAgo(article.publishedAt)}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Market Pulse */}
      <div style={{
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        padding: "14px",
      }}>
        <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
          Market Pulse
        </div>
        {[
          { label: "Fear & Greed", value: 74, color: "#00FFB2", max: 100, unit: "" },
          { label: "BTC Dominance", value: 56.8, color: "#F7931A", max: 100, unit: "%" },
          { label: "VN Sentiment", value: 68, color: "#4D7CFE", max: 100, unit: "" },
          { label: "Gold Momentum", value: 72, color: "#FFD166", max: 100, unit: "" },
        ].map(item => (
          <div key={item.label} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "#64748B" }}>{item.label}</span>
              <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: "600", color: item.color }}>{item.value}{item.unit}</span>
            </div>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(item.value/item.max)*100}%`, background: item.color, borderRadius: "2px", transition: "width 0.5s ease" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Top Movers */}
      <div style={{
        background: "rgba(15,23,42,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px",
        padding: "14px",
      }}>
        <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
          Top Tăng Mạnh
        </div>
        {MOCK_VN_STOCKS.slice(0,5).sort((a,b) => b.changePercent - a.changePercent).map(stock => (
          <div key={stock.symbol} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "rgba(77,124,254,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontFamily: "monospace", fontWeight: "700", color: "#4D7CFE" }}>
                {stock.symbol.slice(0,3)}
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "#E2E8F0" }}>{stock.symbol}</div>
                <div style={{ fontSize: "10px", color: "#475569" }}>{(stock.price/1000).toFixed(1)}k</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: "600", color: stock.changePercent >= 0 ? "#00FFB2" : "#FF4D6D" }}>
                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", justifyContent: "flex-end" }}>
                {stock.changePercent >= 0 ? <TrendingUp size={10} color="#00FFB2" /> : <TrendingDown size={10} color="#FF4D6D" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Telegram CTA */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,229,168,0.08) 0%, rgba(77,124,254,0.08) 100%)",
        border: "1px solid rgba(0,229,168,0.15)",
        borderRadius: "14px",
        padding: "16px",
        textAlign: "center",
      }}>
        <Send size={20} color="#00E5A8" style={{ margin: "0 auto 8px" }} />
        <div style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0", marginBottom: "6px" }}>
          Tín hiệu giao dịch
        </div>
        <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "12px", lineHeight: "1.5" }}>
          Nhận phân tích & tín hiệu mua/bán qua Telegram mỗi ngày
        </div>
        <a href="https://t.me/investhub_vn" target="_blank" rel="noopener noreferrer"
          style={{
            display: "block", padding: "8px 16px", borderRadius: "8px",
            background: "rgba(0,229,168,0.15)", border: "1px solid rgba(0,229,168,0.3)",
            color: "#00E5A8", fontSize: "12px", fontWeight: "600", textDecoration: "none",
            transition: "all 0.15s",
          }}>
          Tham gia miễn phí →
        </a>
      </div>
    </div>
  );
}

export function TopMovers({ stocks, type }: { stocks: any[]; type: "up" | "down" }) {
  return null;
}
export function HotNews({ articles }: { articles: any[] }) {
  return null;
}
export function TelegramCTA() {
  return null;
}
export function OpenAccountCTA() {
  return null;
}
