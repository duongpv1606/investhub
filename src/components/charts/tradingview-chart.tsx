"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type MarketTab = "vnindex" | "vn30" | "vcb" | "hpg" | "fpt" | "gold" | "btc" | "eth" | "xrp";

const TABS = [
  { key: "vnindex" as MarketTab, label: "VN-Index", symbol: "VNINDEX", type: "vn" },
  { key: "vn30" as MarketTab, label: "VN30", symbol: "VN30", type: "vn" },
  { key: "vcb" as MarketTab, label: "VCB", symbol: "VCB", type: "vn" },
  { key: "hpg" as MarketTab, label: "HPG", symbol: "HPG", type: "vn" },
  { key: "fpt" as MarketTab, label: "FPT", symbol: "FPT", type: "vn" },
  { key: "gold" as MarketTab, label: "Vàng", symbol: "TVC:GOLD", type: "gold" },
  { key: "btc" as MarketTab, label: "BTC", symbol: "BINANCE:BTCUSDT", type: "crypto" },
  { key: "eth" as MarketTab, label: "ETH", symbol: "BINANCE:ETHUSDT", type: "crypto" },
  { key: "xrp" as MarketTab, label: "XRP", symbol: "BINANCE:XRPUSDT", type: "crypto" },
];

const INTERVALS = [
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

const VN_STOCKS = ["VNINDEX","VN30","VCB","BID","VIC","HPG","FPT","TCB","MBB","VNM","GAS","MSN","MWG","VHM","CTG","VPB","ACB"];

export function TradingViewChart({ defaultTab = "vnindex" }: { defaultTab?: MarketTab }) {
  const [activeTab, setActiveTab] = useState<MarketTab>(defaultTab);
  const [interval, setInterval] = useState("D");
  const [customSymbol, setCustomSymbol] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTab = TABS.find(t => t.key === activeTab)!;

  const loadChart = (symbol: string, type: string) => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    if (type === "vn") {
      const iframe = document.createElement("iframe");
      iframe.src = `https://tcinvest.tcbs.com.vn/chart/advanced?ticker=${symbol}&type=VN_STOCK&theme=dark`;
      iframe.style.cssText = "width:100%;height:460px;border:none;";
      iframe.loading = "lazy";
      containerRef.current.appendChild(iframe);
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol,
        interval,
        timezone: "Asia/Ho_Chi_Minh",
        theme: "dark",
        style: "1",
        locale: "vi_VN",
        backgroundColor: "#161D2F",
        gridColor: "rgba(31,45,69,0.5)",
        hide_top_toolbar: false,
        save_image: false,
      });
      containerRef.current.appendChild(script);
    }
  };

  useEffect(() => {
    loadChart(currentTab.symbol, currentTab.type);
  }, [activeTab, interval]);

  return (
    <div className="card overflow-hidden">
      {/* Tab bar */}
      <div className="border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-muted mr-1">🇻🇳</span>
          {TABS.filter(t => t.type === "vn").map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.key ? "bg-primary text-bg font-bold" : "text-muted hover:text-white hover:bg-card"
              )}>
              {tab.label}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          {TABS.filter(t => t.type !== "vn").map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.key
                  ? tab.type === "gold" ? "bg-gold/20 text-gold font-bold" : "bg-accent/20 text-accent font-bold"
                  : "text-muted hover:text-white hover:bg-card"
              )}>
              {tab.label}
            </button>
          ))}
          {currentTab.type !== "vn" && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              {INTERVALS.map(iv => (
                <button key={iv.value} onClick={() => setInterval(iv.value)}
                  className={cn("px-2 py-1 rounded text-xs font-mono transition-all",
                    interval === iv.value ? "bg-accent/20 text-accent" : "text-muted hover:text-white"
                  )}>
                  {iv.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Chart container */}
      <div style={{ height: "460px", background: "#161D2F" }}>
        <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* VN Stock quick search */}
      {currentTab.type === "vn" && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted">Mã khác:</span>
            {VN_STOCKS.map(sym => (
              <button key={sym}
                onClick={() => loadChart(sym, "vn")}
                className="text-xs font-mono px-2 py-0.5 rounded bg-card hover:bg-primary/10 hover:text-primary text-muted transition-colors border border-border">
                {sym}
              </button>
            ))}
            <input
              placeholder="Nhập mã..."
              value={customSymbol}
              onChange={e => setCustomSymbol(e.target.value.toUpperCase())}
              onKeyDown={e => {
                if (e.key === "Enter" && customSymbol) {
                  loadChart(customSymbol, "vn");
                  setCustomSymbol("");
                }
              }}
              className="text-xs font-mono px-2 py-0.5 rounded bg-card border border-border text-white placeholder:text-muted outline-none focus:border-primary w-20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
