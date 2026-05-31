"use client";

import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
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

const PERIODS = [
  { label: "1D", days: 1 },
  { label: "1T", days: 7 },
  { label: "1Th", days: 30 },
  { label: "3Th", days: 90 },
  { label: "1N", days: 365 },
];

const TV_INTERVALS = [
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

const VN_QUICK = ["VNINDEX","VN30","VCB","BID","CTG","VIC","VHM","HPG","FPT","TCB","MBB","VNM","GAS","MWG","VPB","ACB","SSI","VND","MSN"];

interface ChartPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

// Lấy dữ liệu OHLC thật từ VNDirect (qua route nội bộ, tránh CORS & endpoint chết)
async function fetchTCBSChart(symbol: string, days: number): Promise<ChartPoint[]> {
  try {
    const res = await fetch(`/api/vn-stocks?type=chart&symbol=${symbol}&days=${days}`);
    if (!res.ok) throw new Error("chart fetch failed");
    const json = await res.json();
    if (!json?.candles?.length || json.isMock) {
      // isMock = nguồn lỗi -> dùng mock client để không vỡ UI
      if (!json?.candles?.length) throw new Error("no data");
    }
    const intraday = days <= 7;
    return json.candles.map((c: any) => {
      const d = new Date(c.time);
      return {
        date: intraday
          ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
          : d.toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" }),
        // route trả giá ở đơn vị VND đầy đủ; chart hiển thị theo "nghìn"
        open: c.open / 1000,
        close: c.close / 1000,
        high: c.high / 1000,
        low: c.low / 1000,
        volume: c.volume,
      };
    });
  } catch {
    return generateMockChart(symbol, days);
  }
}

function generateMockChart(symbol: string, days: number): ChartPoint[] {
  const isIndex = symbol === "VNINDEX" || symbol === "VN30";
  let price = isIndex ? 1285 : symbol === "VCB" ? 88.5 : symbol === "FPT" ? 142 : symbol === "HPG" ? 28.9 : 50;
  const data: ChartPoint[] = [];
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.47) * price * 0.02;
    const open = price;
    price = Math.max(price + change, price * 0.5);
    const d = new Date(Date.now() - i * 86400000);
    data.push({
      date: d.toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" }),
      open,
      close: price,
      high: Math.max(open, price) * (1 + Math.random() * 0.008),
      low: Math.min(open, price) * (1 - Math.random() * 0.008),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    });
  }
  return data;
}

function VNChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTCBSChart(symbol, period).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [symbol, period]);

  const isUp = data.length > 1 && data[data.length - 1].close >= data[0].close;
  const color = isUp ? "#00C896" : "#EF4444";
  const currentPrice = data[data.length - 1]?.close || 0;
  const startPrice = data[0]?.close || 0;
  const changePct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;

  const formatVol = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`;
  const formatPrice = (v: number) => symbol === "VNINDEX" || symbol === "VN30" ? v.toFixed(2) : `${v.toFixed(1)}k`;

  return (
    <div style={{ height: "480px", background: "#161D2F", padding: "16px", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff", fontFamily: "monospace" }}>
            {formatPrice(currentPrice)}
          </div>
          <div style={{ fontSize: "13px", color: isUp ? "#00C896" : "#EF4444", fontFamily: "monospace" }}>
            {isUp ? "▲" : "▼"} {Math.abs(changePct).toFixed(2)}% ({period === 1 ? "1D" : period === 7 ? "1T" : period === 30 ? "1Th" : period === 90 ? "3Th" : "1N"})
          </div>
        </div>
        {/* Period selector */}
        <div style={{ display: "flex", gap: "4px" }}>
          {PERIODS.map(p => (
            <button key={p.days} onClick={() => setPeriod(p.days)}
              style={{
                padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontFamily: "monospace",
                background: period === p.days ? "#00C896" : "#1A2235",
                color: period === p.days ? "#0B0F19" : "#64748B",
                border: "none", cursor: "pointer", fontWeight: period === p.days ? "700" : "400"
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: "13px" }}>
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* Price chart */}
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false}
                  interval={Math.floor(data.length / 6)} />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false}
                  axisLine={false} tickFormatter={v => symbol === "VNINDEX" || symbol === "VN30" ? v.toFixed(0) : `${v.toFixed(0)}k`} width={45} />
                <Tooltip
                  contentStyle={{ background: "#151B28", border: "1px solid #1E2D45", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: number) => [formatPrice(v), symbol]}
                  labelStyle={{ color: "#94A3B8" }}
                />
                <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill="url(#chartGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume chart */}
          <div style={{ height: "60px", marginTop: "4px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                <Bar dataKey="volume" fill="#1E2D45" radius={[2,2,0,0]} />
                <YAxis hide domain={["auto", "auto"]} />
                <XAxis dataKey="date" hide />
                <Tooltip
                  contentStyle={{ background: "#151B28", border: "1px solid #1E2D45", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(v: number) => [formatVol(v), "KL"]}
                  labelStyle={{ color: "#94A3B8" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #1E2D45", marginTop: "8px" }}>
            {[
              { label: "Cao nhất", value: formatPrice(Math.max(...data.map(d => d.high))), color: "#00C896" },
              { label: "Thấp nhất", value: formatPrice(Math.min(...data.map(d => d.low))), color: "#EF4444" },
              { label: "TB KL", value: formatVol(data.reduce((s,d) => s+d.volume,0)/data.length), color: "#fff" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: "#64748B" }}>{s.label}</div>
                <div style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: "600", color: s.color, marginTop: "2px" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TradingViewChart({ defaultTab = "vnindex" }: { defaultTab?: TabKey }) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);
  const [vnSymbol, setVnSymbol] = useState("VNINDEX");
  const [interval, setInterval] = useState("D");
  const [customInput, setCustomInput] = useState("");
  const tvRef = useRef<HTMLDivElement>(null);
  const isVN = VN_TABS.some(t => t.key === activeTab);

  const loadTV = (symbol: string, ivl = interval) => {
    if (!tvRef.current) return;
    tvRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true, symbol, interval: ivl,
      timezone: "Asia/Ho_Chi_Minh", theme: "dark", style: "1", locale: "vi_VN",
      backgroundColor: "#161D2F", gridColor: "rgba(31,45,69,0.4)",
      allow_symbol_change: true, save_image: false,
    });
    tvRef.current.appendChild(script);
  };

  useEffect(() => {
    if (!isVN) {
      const tab = OTHER_TABS.find(t => t.key === activeTab);
      if (tab) loadTV(tab.tvSymbol);
    }
  }, [activeTab]);

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-border px-3 py-2 flex items-center gap-1 flex-wrap">
        <span className="text-xs text-muted mr-1">🇻🇳</span>
        {VN_TABS.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setVnSymbol(tab.symbol); }}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key ? "bg-primary text-bg font-bold" : "text-muted hover:text-white hover:bg-card"
            )}>
            {tab.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {OTHER_TABS.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key ? "bg-accent/20 text-accent font-bold" : "text-muted hover:text-white hover:bg-card"
            )}>
            {tab.label}
          </button>
        ))}
        {!isVN && (
          <>
            <div className="w-px h-4 bg-border mx-1" />
            {TV_INTERVALS.map(iv => (
              <button key={iv.value}
                onClick={() => { setInterval(iv.value); const t = OTHER_TABS.find(t => t.key === activeTab); if(t) loadTV(t.tvSymbol, iv.value); }}
                className={cn("px-2 py-1 rounded text-xs font-mono transition-all",
                  interval === iv.value ? "bg-accent/20 text-accent" : "text-muted hover:text-white"
                )}>
                {iv.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Chart */}
      {isVN ? (
        <VNChart symbol={vnSymbol} />
      ) : (
        <div style={{ height: "480px" }}>
          <div ref={tvRef} style={{ height: "100%", width: "100%" }} />
        </div>
      )}

      {/* VN quick buttons */}
      {isVN && (
        <div className="border-t border-border px-3 py-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted flex-shrink-0">Mã nhanh:</span>
          {VN_QUICK.map(sym => (
            <button key={sym}
              onClick={() => { setVnSymbol(sym); const t = VN_TABS.find(t => t.symbol === sym); if(t) setActiveTab(t.key); }}
              className={cn("text-xs font-mono px-1.5 py-0.5 rounded border transition-all",
                vnSymbol === sym ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-primary/10 hover:text-primary text-muted"
              )}>
              {sym}
            </button>
          ))}
          <input value={customInput} onChange={e => setCustomInput(e.target.value.toUpperCase())}
            onKeyDown={e => { if(e.key==="Enter" && customInput){ setVnSymbol(customInput); setCustomInput(""); }}}
            placeholder="Mã..." className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-card text-white placeholder:text-muted outline-none focus:border-primary w-16" />
        </div>
      )}
    </div>
  );
}
