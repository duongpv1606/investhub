"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "vnindex", label: "VN-Index", symbol: "HOSE:VNINDEX", group: "vn" },
  { key: "vcb", label: "VCB", symbol: "HOSE:VCB", group: "vn" },
  { key: "hpg", label: "HPG", symbol: "HOSE:HPG", group: "vn" },
  { key: "fpt", label: "FPT", symbol: "HOSE:FPT", group: "vn" },
  { key: "gold", label: "Vàng", symbol: "TVC:GOLD", group: "other" },
  { key: "btc", label: "BTC", symbol: "BINANCE:BTCUSDT", group: "other" },
  { key: "eth", label: "ETH", symbol: "BINANCE:ETHUSDT", group: "other" },
  { key: "xrp", label: "XRP", symbol: "BINANCE:XRPUSDT", group: "other" },
] as const;

type TabKey = typeof TABS[number]["key"];

const INTERVALS = [
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

const VN_QUICK = ["VNINDEX","VCB","BID","CTG","VIC","VHM","HPG","FPT","TCB","MBB","VNM","GAS","MWG","VPB","ACB","SSI","VND","MSN"];

export function TradingViewChart({ defaultTab = "vnindex" }: { defaultTab?: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [interval, setInterval] = useState("D");
  const containerRef = useRef<HTMLDivElement>(null);

  const loadChart = (symbol: string, ivl = interval) => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
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
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      withdateranges: true,
      hide_side_toolbar: false,
      support_host: "https://www.tradingview.com",
    });
    containerRef.current.appendChild(script);
  };

  useEffect(() => {
    const tab = TABS.find(t => t.key === activeTab)!;
    loadChart(tab.symbol, interval);
  }, [activeTab]);

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-border px-3 py-2 flex items-center gap-1 flex-wrap">
        <span className="text-xs text-muted mr-1">🇻🇳</span>
        {TABS.filter(t => t.group === "vn").map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key ? "bg-primary text-bg font-bold" : "text-muted hover:text-white hover:bg-card"
            )}>
            {tab.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {TABS.filter(t => t.group === "other").map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key ? "bg-accent/20 text-accent font-bold" : "text-muted hover:text-white hover:bg-card"
            )}>
            {tab.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {INTERVALS.map(iv => (
          <button key={iv.value}
            onClick={() => {
              setInterval(iv.value);
              const tab = TABS.find(t => t.key === activeTab)!;
              loadChart(tab.symbol, iv.value);
            }}
            className={cn("px-2 py-1 rounded text-xs font-mono transition-all",
              interval === iv.value ? "bg-accent/20 text-accent" : "text-muted hover:text-white"
            )}>
            {iv.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: "480px", background: "#161D2F" }}>
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* Quick access */}
      <div className="border-t border-border px-3 py-2 flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-muted flex-shrink-0">Mã nhanh:</span>
        {VN_QUICK.map(sym => (
          <button key={sym}
            onClick={() => loadChart(`HOSE:${sym}`)}
            className="text-xs font-mono px-1.5 py-0.5 rounded border border-border bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-muted transition-all">
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
