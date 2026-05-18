"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { MarketTab } from "@/types";
import { TRADING_VIEW_SYMBOLS } from "@/lib/utils";
import { Maximize2 } from "lucide-react";

const TABS: { key: MarketTab; label: string; symbol: string }[] = [
  { key: "vnindex", label: "VN-Index", symbol: "TVC:VNINDEX" },
  { key: "gold", label: "Vàng", symbol: "TVC:GOLD" },
  { key: "btc", label: "BTC", symbol: "BINANCE:BTCUSDT" },
  { key: "eth", label: "ETH", symbol: "BINANCE:ETHUSDT" },
  { key: "xrp", label: "XRP", symbol: "BINANCE:XRPUSDT" },
];

const INTERVALS = [
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

interface TradingViewChartProps {
  defaultTab?: MarketTab;
}

export function TradingViewChart({ defaultTab = "vnindex" }: TradingViewChartProps) {
  const [activeTab, setActiveTab] = useState<MarketTab>(defaultTab);
  const [interval, setInterval] = useState("D");
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  const currentTab = TABS.find(t => t.key === activeTab)!;

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove old widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: currentTab.symbol,
      interval,
      timezone: "Asia/Ho_Chi_Minh",
      theme: "dark",
      style: "1",
      locale: "vi_VN",
      backgroundColor: "#161D2F",
      gridColor: "rgba(31,45,69,0.5)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, [activeTab, interval]);

  return (
    <div className="card overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.key
                  ? "bg-primary text-bg font-bold"
                  : "text-muted hover:text-white hover:bg-card"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {INTERVALS.map(iv => (
              <button
                key={iv.value}
                onClick={() => setInterval(iv.value)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-mono transition-all",
                  interval === iv.value
                    ? "bg-accent/20 text-accent"
                    : "text-muted hover:text-white"
                )}
              >
                {iv.label}
              </button>
            ))}
          </div>
          <button className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-card transition-colors">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="tradingview-widget-container" style={{ height: "460px" }}>
        <div
          ref={containerRef}
          className="tradingview-widget-container__widget"
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
}
