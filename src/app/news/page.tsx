"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { MOCK_NEWS } from "@/lib/utils";

const CATS = [
  { key: "all", label: "Tất cả" },
  { key: "stock", label: "Chứng khoán" },
  { key: "gold", label: "Vàng" },
  { key: "crypto", label: "Crypto" },
];

const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  stock: { bg: "rgba(77,124,254,.14)", color: "#4D7CFE" },
  crypto: { bg: "rgba(247,147,26,.14)", color: "#F7931A" },
  gold: { bg: "rgba(255,209,102,.14)", color: "#FFD166" },
  macro: { bg: "rgba(148,163,184,.1)", color: "#94A3B8" },
};

const SENT_MAP: Record<string, { label: string; color: string; bg: string }> = {
  bullish: { label: "Bullish", color: "#00FFB2", bg: "rgba(0,255,178,.1)" },
  bearish: { label: "Bearish", color: "#FF4D6D", bg: "rgba(255,77,109,.1)" },
  neutral: { label: "Neutral", color: "#94A3B8", bg: "rgba(148,163,184,.1)" },
};

function getSentiment(title: string) {
  const t = title.toLowerCase();
  if (["tăng","phục hồi","mua","vượt","bull","rally","surge","lãi"].some(w => t.includes(w))) return "bullish";
  if (["giảm","bán","sụt","lao","bear","drop","fall","loss","thua"].some(w => t.includes(w))) return "bearish";
  return "neutral";
}

function timeAgo(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} ngày trước`;
  if (h > 0) return `${h} giờ trước`;
  if (m > 0) return `${m} phút trước`;
  return "Vừa xong";
}

export default function NewsPage() {
  const [news, setNews] = useState<any[]>(MOCK_NEWS);
  const [activeCat, setActiveCat] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?limit=30")
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : d?.news;
        if (Array.isArray(list) && list.length > 0) {
          setNews(list.map((n: any) => ({ ...n, marketType: n.marketType ?? n.category })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCat === "all"
    ? news
    : news.filter(n => n.marketType === activeCat);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "system-ui,sans-serif" }}>
      <Header />
      <MarketTicker />

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-heading)", margin: "0 0 4px" }}>
            Tin tức tài chính
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>
            Cập nhật từ CafeF, VnExpress, CoinTelegraph — {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
          {CATS.map(cat => (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)}
              style={{
                padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                cursor: "pointer", transition: "all .15s",
                background: activeCat === cat.key ? "var(--primary-muted)" : "var(--card-hover)",
                border: `1px solid ${activeCat === cat.key ? "var(--primary)" : "var(--card-border)"}`,
                color: activeCat === cat.key ? "var(--primary)" : "var(--text-muted)",
              }}>
              {cat.label}
            </button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-ultra-dim)", fontFamily: "monospace", alignSelf: "center" }}>
            {filtered.length} bài viết
          </span>
        </div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: "16px", alignItems: "start" }}>

          {/* Main */}
          <div>
            {/* Featured 4 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              {filtered.slice(0, 4).map((a: any) => {
                const tc = TYPE_COLOR[a.marketType] || TYPE_COLOR.macro;
                const sent = SENT_MAP[getSentiment(a.title)];
                return (
                  <a key={a.id} href={a.sourceUrl || a.url || "#"} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "block", textDecoration: "none",
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "12px", padding: "14px",
                      transition: "all .15s", cursor: "pointer",
                      boxShadow: "var(--shadow)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--card-border)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                    <div style={{ display: "flex", gap: "5px", marginBottom: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontWeight: "600", background: tc.bg, color: tc.color }}>
                        {a.marketType === "crypto" ? "Crypto" : a.marketType === "gold" ? "Vàng" : "Chứng khoán"}
                      </span>
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontWeight: "600", background: sent.bg, color: sent.color }}>
                        {sent.label}
                      </span>
                    </div>
                    {a.imageUrl && (
                      <img src={a.imageUrl} alt="" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }} loading="lazy" />
                    )}
                    <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", lineHeight: "1.4", margin: "0 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {a.title}
                    </h3>
                    <p style={{ fontSize: "11px", color: "var(--text-dim)", margin: "0 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.4" }}>
                      {a.summary || a.excerpt}
                    </p>
                    <div style={{ fontSize: "10px", color: "var(--text-ultra-dim)" }}>
                      {a.sourceName || a.source} · {timeAgo(a.publishedAt)}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Rest list */}
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
              {filtered.slice(4).map((a: any, i: number) => {
                const tc = TYPE_COLOR[a.marketType] || TYPE_COLOR.macro;
                const sent = SENT_MAP[getSentiment(a.title)];
                return (
                  <a key={a.id} href={a.sourceUrl || a.url || "#"} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", gap: "10px", padding: "12px 14px",
                      textDecoration: "none", transition: "background .12s",
                      borderBottom: i < filtered.slice(4).length - 1 ? "1px solid var(--card-border)" : "none",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--card-hover)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <div style={{ width: "52px", height: "44px", borderRadius: "8px", flexShrink: 0, background: "var(--card-hover)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                      {a.imageUrl
                        ? <img src={a.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                        : a.marketType === "crypto" ? "₿" : a.marketType === "gold" ? "🥇" : "📈"
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", fontFamily: "monospace", fontWeight: "600", background: tc.bg, color: tc.color }}>
                          {a.marketType === "crypto" ? "Crypto" : a.marketType === "gold" ? "Vàng" : "Chứng khoán"}
                        </span>
                        <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", fontFamily: "monospace", fontWeight: "600", background: sent.bg, color: sent.color }}>
                          {sent.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-secondary)", margin: "0 0 3px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.35" }}>
                        {a.title}
                      </p>
                      <div style={{ fontSize: "10px", color: "var(--text-ultra-dim)" }}>
                        {a.sourceName || a.source} · {timeAgo(a.publishedAt)}
                      </div>
                    </div>
                  </a>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--text-ultra-dim)", fontSize: "13px" }}>
                  Không có tin tức
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: "72px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
              <div style={{ padding: "10px 13px", borderBottom: "1px solid var(--card-border)", fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: ".7px", color: "var(--text-ultra-dim)", display: "flex", alignItems: "center", gap: "7px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF4D6D", animation: "pulse 1.5s ease infinite" }} />
                Tin nóng
              </div>
              {news.slice(0, 8).map((a: any) => (
                <a key={a.id} href={a.sourceUrl || a.url || "#"} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", padding: "9px 13px", borderBottom: "1px solid var(--card-border)", textDecoration: "none", transition: "background .12s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--card-hover)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <p style={{ fontSize: "11px", fontWeight: "500", color: "var(--text-secondary)", margin: "0 0 3px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.35" }}>
                    {a.title}
                  </p>
                  <div style={{ fontSize: "10px", color: "var(--text-ultra-dim)" }}>
                    {a.sourceName || a.source} · {timeAgo(a.publishedAt)}
                  </div>
                </a>
              ))}
            </div>

            <a href="https://t.me/markethub_vn" target="_blank" rel="noopener noreferrer"
              style={{ display: "block", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "16px", textAlign: "center", textDecoration: "none", boxShadow: "var(--shadow)" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", marginBottom: "6px" }}>Tín hiệu giao dịch</div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "12px", lineHeight: "1.5" }}>
                Nhận phân tích & tín hiệu mua/bán qua Telegram mỗi ngày
              </div>
              <div style={{ padding: "8px", borderRadius: "8px", background: "var(--primary-muted)", border: "1px solid var(--primary)", color: "var(--primary)", fontSize: "12px", fontWeight: "600" }}>
                Tham gia miễn phí →
              </div>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
