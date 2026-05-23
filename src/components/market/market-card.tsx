"use client";
import type { MarketPrice } from "@/types";

interface MarketCardProps {
  data: MarketPrice;
  onClick?: () => void;
  active?: boolean;
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 72;
    const y = 22 - ((v - min) / range) * 20 - 1;
    return `${x},${y}`;
  }).join(" ");
  const color = positive ? "#00FFB2" : "#FF4D6D";
  const fillPts = `0,22 ${pts} 72,22`;
  return (
    <svg width="72" height="24" viewBox="0 0 72 24" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sf-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sf-${positive})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const TYPE_CONFIG: Record<string, { accent: string; bg: string }> = {
  index: { accent: "#4D7CFE", bg: "rgba(77,124,254,0.08)" },
  stock: { accent: "#4D7CFE", bg: "rgba(77,124,254,0.08)" },
  gold: { accent: "#FFD166", bg: "rgba(255,209,102,0.08)" },
  crypto: { accent: "#F7931A", bg: "rgba(247,147,26,0.08)" },
};

export function MarketCard({ data, onClick, active }: MarketCardProps) {
  const isUp = data.changePercent >= 0;
  const cfg = TYPE_CONFIG[data.type] || TYPE_CONFIG.stock;

  const fmtPrice = () => {
    if (data.type === "gold" && data.currency === "VND") {
      return `${(data.price / 1e6).toFixed(1)}M`;
    }
    if (data.price >= 1000) return data.price.toLocaleString("en", { maximumFractionDigits: 0 });
    if (data.price < 10) return data.price.toFixed(4);
    return data.price.toFixed(2);
  };

  return (
    <button onClick={onClick} style={{
      background: active ? `rgba(0,229,168,0.05)` : "rgba(15,23,42,0.7)",
      backdropFilter: "blur(12px)",
      border: `1px solid ${active ? "rgba(0,229,168,0.25)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: "12px",
      padding: "14px 16px",
      textAlign: "left",
      width: "100%",
      cursor: "pointer",
      transition: "all 0.2s",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}}
    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}}>

      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: isUp ? "rgba(0,255,178,0.4)" : "rgba(255,77,109,0.4)", borderRadius: "12px 12px 0 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: "600", color: cfg.accent, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {data.symbol}
          </div>
          <div style={{ fontSize: "12px", color: "rgba(148,163,184,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "90px" }}>
            {data.displayName || data.name}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: isUp ? "#00FFB2" : "#FF4D6D", animation: "pulse 2s ease infinite" }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "18px", fontFamily: "monospace", fontWeight: "700", color: "#F1F5F9", lineHeight: 1 }}>
            {data.currency === "USD" && data.price < 100000 ? "$" : ""}{fmtPrice()}
          </div>
          <div style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: "600", marginTop: "4px", color: isUp ? "#00FFB2" : "#FF4D6D" }}>
            {isUp ? "▲" : "▼"} {Math.abs(data.changePercent).toFixed(2)}%
          </div>
        </div>
        {data.sparkline && <Sparkline data={data.sparkline} positive={isUp} />}
      </div>
    </button>
  );
}
