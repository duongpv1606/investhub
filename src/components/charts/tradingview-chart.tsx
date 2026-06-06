"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

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

// ── Candlestick SVG chart (nến) — theme-aware, responsive ─────────────────────
function CandleChart({
  data, upColor, downColor, axis, grid, formatPrice,
}: {
  data: ChartPoint[];
  upColor: string;
  downColor: string;
  axis: string;
  grid: string;
  formatPrice: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) return null;

  const W = 1000, H = 320;
  const pad = { t: 10, b: 22, l: 6, r: 56 };
  const cw = W - pad.l - pad.r;
  const ch = H - pad.t - pad.b;

  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const maxP = Math.max(...highs) * 1.002;
  const minP = Math.min(...lows) * 0.998;
  const range = maxP - minP || 1;

  const gap = cw / data.length;
  const barW = Math.max(1.5, gap * 0.6);
  const py = (p: number) => pad.t + ((maxP - p) / range) * ch;
  const px = (i: number) => pad.l + i * gap + gap / 2;

  const yTicks = 5;
  const labelEvery = Math.ceil(data.length / 7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}
      onMouseLeave={() => setHover(null)}>
      {/* Grid + price labels */}
      {Array.from({ length: yTicks }).map((_, i) => {
        const y = pad.t + (i / (yTicks - 1)) * ch;
        const val = maxP - (i / (yTicks - 1)) * range;
        return (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke={grid} strokeWidth={0.8} />
            <text x={W - pad.r + 5} y={y + 3} fontSize={10} fill={axis}>{formatPrice(val)}</text>
          </g>
        );
      })}

      {/* Candles */}
      {data.map((c, i) => {
        const isUp = c.close >= c.open;
        const col = isUp ? upColor : downColor;
        const bodyTop = py(Math.max(c.open, c.close));
        const bodyBot = py(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);
        return (
          <g key={i} onMouseEnter={() => setHover(i)}>
            {/* hover highlight */}
            {hover === i && (
              <rect x={px(i) - gap / 2} y={pad.t} width={gap} height={ch} fill={axis} fillOpacity={0.08} />
            )}
            {/* wick */}
            <line x1={px(i)} x2={px(i)} y1={py(c.high)} y2={py(c.low)} stroke={col} strokeWidth={1} />
            {/* body */}
            <rect x={px(i) - barW / 2} y={bodyTop} width={barW} height={bodyH} fill={col} />
          </g>
        );
      })}

      {/* X labels */}
      {data.map((c, i) => (i % labelEvery === 0 ? (
        <text key={i} x={px(i)} y={H - 6} fontSize={10} fill={axis} textAnchor="middle">{c.date}</text>
      ) : null))}

      {/* Tooltip */}
      {hover !== null && data[hover] && (() => {
        const c = data[hover];
        const tx = Math.min(Math.max(px(hover) + 8, pad.l), W - pad.r - 150);
        return (
          <g>
            <line x1={px(hover)} x2={px(hover)} y1={pad.t} y2={pad.t + ch} stroke={axis} strokeWidth={0.6} strokeDasharray="3 3" />
            <foreignObject x={tx} y={pad.t} width={150} height={92}>
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 6, padding: "6px 8px", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "var(--text)", lineHeight: 1.5, boxShadow: "var(--shadow)" }}>
                <div style={{ color: "var(--text-dim)", marginBottom: 2 }}>{c.date}</div>
                <div>O <b>{formatPrice(c.open)}</b></div>
                <div>H <b style={{ color: upColor }}>{formatPrice(c.high)}</b></div>
                <div>L <b style={{ color: downColor }}>{formatPrice(c.low)}</b></div>
                <div>C <b>{formatPrice(c.close)}</b></div>
              </div>
            </foreignObject>
          </g>
        );
      })()}
    </svg>
  );
}

function VNChart({ symbol }: { symbol: string }) {
  const { theme } = useTheme();
  const [data, setData] = useState<ChartPoint[]>([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  // Theme-aware tokens cho recharts (không đọc được CSS var trực tiếp)
  const C = theme === "light"
    ? { panel: "#FFFFFF", text: "#0F172A", axis: "#6B7280", grid: "#1E293B14", tooltipBg: "#FFFFFF", tooltipBorder: "#0F172A1a", vol: "#CBD5E1", btnIdle: "#EEF1F8", btnIdleText: "#6B7280", border: "#0F172A1a" }
    : { panel: "#161D2F", text: "#FFFFFF", axis: "#64748B", grid: "#FFFFFF14", tooltipBg: "#151B28", tooltipBorder: "#1E2D45", vol: "#1E2D45", btnIdle: "#1A2235", btnIdleText: "#64748B", border: "#1E2D45" };
  const upColor = theme === "light" ? "#16A34A" : "#00C896";
  const downColor = theme === "light" ? "#DC2626" : "#EF4444";

  useEffect(() => {
    setLoading(true);
    fetchTCBSChart(symbol, period).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [symbol, period]);

  const isUp = data.length > 1 && data[data.length - 1].close >= data[0].close;
  const currentPrice = data[data.length - 1]?.close || 0;
  const startPrice = data[0]?.close || 0;
  const changePct = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;

  const formatVol = (v: number) => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : `${(v/1e3).toFixed(0)}K`;
  const formatPrice = (v: number) => symbol === "VNINDEX" || symbol === "VN30" ? v.toFixed(2) : `${v.toFixed(1)}k`;

  return (
    <div style={{ height: "480px", background: C.panel, padding: "16px", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: C.text, fontFamily: "monospace" }}>
            {formatPrice(currentPrice)}
          </div>
          <div style={{ fontSize: "13px", color: isUp ? upColor : downColor, fontFamily: "monospace" }}>
            {isUp ? "▲" : "▼"} {Math.abs(changePct).toFixed(2)}% ({period === 1 ? "1D" : period === 7 ? "1T" : period === 30 ? "1Th" : period === 90 ? "3Th" : "1N"})
          </div>
        </div>
        {/* Period selector */}
        <div style={{ display: "flex", gap: "4px" }}>
          {PERIODS.map(p => (
            <button key={p.days} onClick={() => setPeriod(p.days)}
              style={{
                padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontFamily: "monospace",
                background: period === p.days ? "var(--primary)" : C.btnIdle,
                color: period === p.days ? (theme === "light" ? "#fff" : "#0B0F19") : C.btnIdleText,
                border: "none", cursor: "pointer", fontWeight: period === p.days ? "700" : "400"
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.axis, fontSize: "13px" }}>
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* Price chart (nến) */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <CandleChart
              data={data}
              upColor={upColor}
              downColor={downColor}
              axis={C.axis}
              grid={C.grid}
              formatPrice={formatPrice}
            />
          </div>

          {/* Volume chart */}
          <div style={{ height: "60px", marginTop: "4px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                <Bar dataKey="volume" fill={C.vol} radius={[2,2,0,0]} />
                <YAxis hide domain={["auto", "auto"]} />
                <XAxis dataKey="date" hide />
                <Tooltip
                  contentStyle={{ background: C.tooltipBg, border: `1px solid ${C.tooltipBorder}`, borderRadius: "8px", fontSize: "11px", color: C.text }}
                  formatter={(v: number) => [formatVol(v), "KL"]}
                  labelStyle={{ color: C.axis }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: `1px solid ${C.border}`, marginTop: "8px" }}>
            {[
              { label: "Cao nhất", value: formatPrice(Math.max(...data.map(d => d.high))), color: upColor },
              { label: "Thấp nhất", value: formatPrice(Math.min(...data.map(d => d.low))), color: downColor },
              { label: "TB KL", value: formatVol(data.reduce((s,d) => s+d.volume,0)/data.length), color: C.text },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "10px", color: C.axis }}>{s.label}</div>
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
  const { theme } = useTheme();
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
      timezone: "Asia/Ho_Chi_Minh", theme: theme === "light" ? "light" : "dark", style: "1", locale: "vi_VN",
      backgroundColor: theme === "light" ? "#FFFFFF" : "#161D2F",
      gridColor: theme === "light" ? "rgba(15,23,42,0.08)" : "rgba(31,45,69,0.4)",
      allow_symbol_change: true, save_image: false,
    });
    tvRef.current.appendChild(script);
  };

  useEffect(() => {
    if (!isVN) {
      const tab = OTHER_TABS.find(t => t.key === activeTab);
      if (tab) loadTV(tab.tvSymbol);
    }
  }, [activeTab, theme]);

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-border px-3 py-2 flex items-center gap-1 flex-wrap">
        <span className="text-xs text-muted mr-1">🇻🇳</span>
        {VN_TABS.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setVnSymbol(tab.symbol); }}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.key ? "bg-primary text-white font-bold" : "text-muted hover:text-white hover:bg-card"
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
