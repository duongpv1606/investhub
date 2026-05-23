"use client";
import { cn } from "@/lib/utils";
import type { MarketPrice } from "@/types";

const TICKER_DATA = [
  { symbol: "VNINDEX", price: "1.285,42", change: "+0.97%", up: true, type: "stock" },
  { symbol: "HNXINDEX", price: "238,15", change: "-0.76%", up: false, type: "stock" },
  { symbol: "BTC", price: "$103,420", change: "-0.40%", up: false, type: "crypto" },
  { symbol: "ETH", price: "$3,892", change: "+2.15%", up: true, type: "crypto" },
  { symbol: "GOLD", price: "$3,342", change: "+0.46%", up: true, type: "gold" },
  { symbol: "SJC", price: "110.5M", change: "+0.45%", up: true, type: "gold" },
  { symbol: "XRP", price: "$2.48", change: "-1.20%", up: false, type: "crypto" },
  { symbol: "VCB", price: "88.5k", change: "+0.34%", up: true, type: "stock" },
  { symbol: "HPG", price: "28.9k", change: "+2.12%", up: true, type: "stock" },
  { symbol: "FPT", price: "142k", change: "+3.27%", up: true, type: "stock" },
  { symbol: "DXY", price: "104.2", change: "-0.18%", up: false, type: "macro" },
];

const TYPE_COLORS: Record<string, string> = {
  stock: "#4D7CFE",
  crypto: "#F7931A",
  gold: "#FFD166",
  macro: "#94A3B8",
};

export function MarketTicker() {
  const items = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div style={{
      overflow: "hidden",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(5,8,22,0.6)",
      height: "36px",
      display: "flex",
      alignItems: "center",
      position: "relative",
    }}>
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "40px", background: "linear-gradient(to right, rgba(5,8,22,0.9), transparent)", zIndex: 1 }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40px", background: "linear-gradient(to left, rgba(5,8,22,0.9), transparent)", zIndex: 1 }} />

      <div className="ticker-animate" style={{ display: "flex", gap: "0", width: "max-content" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 20px", borderRight: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: "600", color: TYPE_COLORS[item.type] || "#94A3B8" }}>
              {item.symbol}
            </span>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#CBD5E1" }}>
              {item.price}
            </span>
            <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: "600", color: item.up ? "#00FFB2" : "#FF4D6D" }}>
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
