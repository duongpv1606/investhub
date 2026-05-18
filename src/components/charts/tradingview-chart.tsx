"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type TabKey = "vnindex" | "vn30" | "vcb" | "hpg" | "fpt" | "gold" | "btc" | "eth" | "xrp";

const VN_TABS = [
  { key: "vnindex" as TabKey, label: "VN-Index", symbol: "VNINDEX" },
  { key: "vn30" as TabKey, label: "VN30", symbol: "VN30F1!" },
  { key: "vcb" as TabKey, label: "VCB", symbol: "VCB" },
  { key: "hpg" as TabKey, label: "HPG", symbol: "HPG" },
  { key: "fpt" as TabKey, label: "FPT", symbol: "FPT" },
];

const OTHER_TABS = [
  { key: "gold" as TabKey, label: "Vàng", symbol: "TVC:GOLD", color: "gold" },
  { key: "btc" as TabKey, label: "BTC", symbol: "BINANCE:BTCUSDT", color: "accent" },
  { key: "eth" as TabKey, label: "ETH", symbol: "BINANCE:ETHUSDT", color: "accent" },
  { key: "xrp" as TabKey, label: "XRP", symbol: "BINANCE:XRPUSDT", color: "accent" },
];

const ALL_TABS = [...VN_TABS, ...OTHER_TABS];
const INTERVALS = [{ label: "1H", value: "60" }, { label: "4H", value: "240" }, { label: "1D", value: "D" }, { label: "1W", value: "W" }];
const VN_QUICK = ["VNINDEX","VN30","VCB","BID","VIC","HPG","FPT","TCB","MBB","VNM","GAS","MWG","VHM","CTG","VPB","ACB","SSI","VND"];

function getTVSymbol(symbol: string, isVN: boolean): string {
  if (!isVN) return symbol;
  if (symbol === "VNINDEX") return "HOSE:VNINDEX";
  if (symbol === "VN30") return "HOSE:VN30F1!";
  return `HOSE:${symbol}`;
}

export function TradingViewChart({ defaultTab = "vnindex" }: { defaultTab?: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [interval, setInterval] = useState("D");
  const [currentSymbol, setCurrentSymbol] = useState("HOSE:VNINDEX");
  const [customInput, setCustomInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const isVNTab = VN_TABS.some(t => t.key === activeTab);

  const loadTVChart = (tvSymbol: string, ivl = interval) => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: ivl,
      timezone: "Asia/Ho_Chi_Minh",
      theme: "dark",
      style: "1",
      locale: "vi_VN",
      backgroundColor: "#161D2F",
      gridColor: "rgba(31,45,69,0.5)",
      hide_top_toolbar: false,
      allow_symbol_change: true,
      save_image: false,
      support_host: "https://www.tradingview.com",
    });
    containerRef.current.appendChild(script);
    setCurrentSymbol(tvSymbol);
  };

  useEffect(() => {
    const tab = ALL_TABS.find(t => t.key === activeTab)!;
    const sym = getTVSymbol(tab.symbol, VN_TABS.some(t => t.key === activeTab));
    loadTVChart(sym, interval);
  }, [activeTab, interval]);

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-border px-3 py-2 flex items-center gap-1 flex-wrap">
        <span className="text-xs text-muted font-mono">🇻🇳</span>
        {VN_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key ? "bg-primary text-bg font-bold" : "text-muted hover:text-white hover:bg-card"
            )}>
            {tab.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {OTHER_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key
                ? tab.color === "gold" ? "bg-yellow-500/20 text-yellow-400 font-bold" : "bg-blue-500/20 text-blue-400 font-bold"
                : "text-muted hover:text-white hover:bg-card"
            )}>
            {tab.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {INTERVALS.map(iv => (
          <button key={iv.value} onClick={() => { setInterval(iv.value); const tab = ALL_TABS.find(t => t.key === activeTab)!; loadTVChart(getTVSymbol(tab.symbol, isVNTab), iv.value); }}
            className={cn("px-2 py-1 rounded text-xs font-mono transition-all",
              interval === iv.value ? "bg-blue-500/20 text-blue-400" : "text-muted hover:text-white"
            )}>
            {iv.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: "460px", background: "#161D2F" }}>
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* Quick stock buttons */}
      <div className="border-t border-border px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted flex-shrink-0">Xem nhanh:</span>
        {VN_QUICK.map(sym => (
          <button key={sym}
            onClick={() => loadTVChart(`HOSE:${sym}`)}
            className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-muted transition-colors">
            {sym}
          </button>
        ))}
        <input
          value={customInput}
          onChange={e => setCustomInput(e.target.value.toUpperCase())}
          onKeyDown={e => {
            if (e.key === "Enter" && customInput.trim()) {
              loadTVChart(`HOSE:${customInput.trim()}`);
              setCustomInput("");
            }
          }}
          placeholder="Mã..."
          className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-card text-white placeholder:text-muted outline-none focus:border-primary w-16 transition-colors"
        />
      </div>
    </div>
  );
}
