"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type TabKey = "vnindex" | "vcb" | "hpg" | "fpt" | "tcb" | "gold" | "btc" | "eth" | "xrp";

const VN_TABS = [
  { key: "vnindex" as TabKey, label: "VN-Index", symbol: "VNINDEX" },
  { key: "vcb" as TabKey, label: "VCB", symbol: "VCB" },
  { key: "hpg" as TabKey, label: "HPG", symbol: "HPG" },
  { key: "fpt" as TabKey, label: "FPT", symbol: "FPT" },
  { key: "tcb" as TabKey, label: "TCB", symbol: "TCB" },
];

const OTHER_TABS = [
  { key: "gold" as TabKey, label: "🥇 Vàng", tvSymbol: "TVC:GOLD" },
  { key: "btc" as TabKey, label: "₿ BTC", tvSymbol: "BINANCE:BTCUSDT" },
  { key: "eth" as TabKey, label: "Ξ ETH", tvSymbol: "BINANCE:ETHUSDT" },
  { key: "xrp" as TabKey, label: "XRP", tvSymbol: "BINANCE:XRPUSDT" },
];

const INTERVALS = [
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

const VN_QUICK = [
  "VNINDEX","VN30","VCB","BID","CTG","VIC","VHM",
  "HPG","FPT","TCB","MBB","VNM","GAS","MWG","VPB","ACB","SSI","VND","MSN","VRE"
];

export function TradingViewChart({ defaultTab = "vnindex" }: { defaultTab?: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [interval, setInterval] = useState("D");
  const [vnSymbol, setVnSymbol] = useState("VNINDEX");
  const [customInput, setCustomInput] = useState("");
  const tvRef = useRef<HTMLDivElement>(null);

  const isVN = VN_TABS.some(t => t.key === activeTab);

  // Load TradingView widget cho crypto/gold
  const loadTVWidget = (symbol: string, ivl = interval) => {
    if (!tvRef.current) return;
    tvRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: ivl,
      timezone: "Asia/Ho_Chi_Minh",
      theme: "dark",
      style: "1",
      locale: "vi_VN",
      backgroundColor: "#161D2F",
      gridColor: "rgba(31,45,69,0.4)",
      allow_symbol_change: true,
      save_image: false,
      support_host: "https://www.tradingview.com",
    });
    tvRef.current.appendChild(script);
  };

  useEffect(() => {
    if (!isVN) {
      const tab = OTHER_TABS.find(t => t.key === activeTab);
      if (tab) loadTVWidget(tab.tvSymbol, interval);
    }
  }, [activeTab, interval]);

  // VN chart URL từ Wiget DCHART VNDirect
  const getVNChartUrl = (sym: string) =>
    `https://dchart.vndirect.com.vn/#/?code=${sym}&type=CANDLE&period=D`;

  return (
    <div className="card overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-border px-3 py-2 flex items-center gap-1 flex-wrap">
        {/* VN tabs */}
        <span className="text-xs text-muted mr-1 flex-shrink-0">🇻🇳</span>
        {VN_TABS.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setVnSymbol(tab.symbol); }}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key
                ? "bg-primary text-bg font-bold"
                : "text-muted hover:text-white hover:bg-card"
            )}>
            {tab.label}
          </button>
        ))}

        <div className="w-px h-4 bg-border mx-1 flex-shrink-0" />

        {/* Crypto/Gold tabs */}
        {OTHER_TABS.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key
                ? "bg-accent/20 text-accent font-bold"
                : "text-muted hover:text-white hover:bg-card"
            )}>
            {tab.label}
          </button>
        ))}

        {/* Interval (chỉ hiện khi crypto/gold) */}
        {!isVN && (
          <>
            <div className="w-px h-4 bg-border mx-1 flex-shrink-0" />
            {INTERVALS.map(iv => (
              <button key={iv.value}
                onClick={() => {
                  setInterval(iv.value);
                  const tab = OTHER_TABS.find(t => t.key === activeTab);
                  if (tab) loadTVWidget(tab.tvSymbol, iv.value);
                }}
                className={cn(
                  "px-2 py-1 rounded text-xs font-mono transition-all",
                  interval === iv.value ? "bg-accent/20 text-accent" : "text-muted hover:text-white"
                )}>
                {iv.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Chart area */}
      <div style={{ height: "480px", background: "#161D2F", position: "relative" }}>
        {isVN ? (
          // VNDirect chart cho cổ phiếu VN
          <iframe
            key={vnSymbol}
            src={getVNChartUrl(vnSymbol)}
            style={{ width: "100%", height: "100%", border: "none" }}
            loading="lazy"
            title={`Chart ${vnSymbol}`}
          />
        ) : (
          // TradingView cho crypto/gold
          <div ref={tvRef} style={{ height: "100%", width: "100%" }} />
        )}
      </div>

      {/* VN quick access buttons */}
      {isVN && (
        <div className="border-t border-border px-3 py-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted flex-shrink-0">Mã nhanh:</span>
          {VN_QUICK.map(sym => (
            <button key={sym}
              onClick={() => {
                setVnSymbol(sym);
                // Cập nhật active tab nếu có
                const tab = VN_TABS.find(t => t.symbol === sym);
                if (tab) setActiveTab(tab.key);
              }}
              className={cn(
                "text-xs font-mono px-1.5 py-0.5 rounded border transition-all",
                vnSymbol === sym
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-muted"
              )}>
              {sym}
            </button>
          ))}
          {/* Custom input */}
          <input
            value={customInput}
            onChange={e => setCustomInput(e.target.value.toUpperCase())}
            onKeyDown={e => {
              if (e.key === "Enter" && customInput.trim()) {
                setVnSymbol(customInput.trim());
                setCustomInput("");
              }
            }}
            placeholder="Mã..."
            className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-card text-white placeholder:text-muted outline-none focus:border-primary w-16 transition-colors"
          />
        </div>
      )}
    </div>
  );
}
