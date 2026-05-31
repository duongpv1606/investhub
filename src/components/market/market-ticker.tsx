"use client";

import { useEffect, useState } from "react";

interface TickerItem { s: string; p: string; c: string; up: boolean; col: string; }

// Giá trị mặc định hiển thị ngay khi chưa fetch xong (sẽ bị thay bằng dữ liệu thật)
const DEFAULT_ITEMS: TickerItem[] = [
  { s: "VNINDEX", p: "—", c: "", up: true, col: "#4D7CFE" },
  { s: "HNXINDEX", p: "—", c: "", up: true, col: "#4D7CFE" },
  { s: "BTC", p: "—", c: "", up: true, col: "#F7931A" },
  { s: "ETH", p: "—", c: "", up: true, col: "#F7931A" },
  { s: "XAU/USD", p: "—", c: "", up: true, col: "#FFD166" },
  { s: "SJC", p: "—", c: "", up: true, col: "#FFD166" },
  { s: "VCB", p: "—", c: "", up: true, col: "#4D7CFE" },
  { s: "HPG", p: "—", c: "", up: true, col: "#4D7CFE" },
  { s: "FPT", p: "—", c: "", up: true, col: "#4D7CFE" },
];

const CRYPTO_COL = "#F7931A";
const STOCK_COL = "#4D7CFE";
const GOLD_COL = "#FFD166";
const FX_COL = "#94A3B8";

function pct(v: number): string {
  if (v == null || Number.isNaN(v)) return "";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
}

async function getJSON(url: string): Promise<any | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [vn, crypto, gold, indices] = await Promise.all([
        getJSON("/api/vn-stocks?type=overview"),
        getJSON("/api/crypto"),
        getJSON("/api/gold"),
        getJSON("/api/indices"),
      ]);

      const next: TickerItem[] = [];

      // VN-Index, HNX-Index
      const vnIdx: any[] = vn?.indices ?? [];
      const findIdx = (name: string) => vnIdx.find((i) => i.name === name);
      const vni = findIdx("VN-Index");
      const hnx = findIdx("HNX-Index");
      if (vni) next.push({ s: "VNINDEX", p: vni.value.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), c: pct(vni.changePct), up: vni.changePct >= 0, col: STOCK_COL });
      if (hnx) next.push({ s: "HNXINDEX", p: hnx.value.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), c: pct(hnx.changePct), up: hnx.changePct >= 0, col: STOCK_COL });

      // Crypto: BTC, ETH, XRP
      const assets: any[] = crypto?.assets ?? [];
      for (const sym of ["BTC", "ETH", "XRP"]) {
        const a = assets.find((x) => x.symbol === sym);
        if (a) next.push({ s: sym, p: `$${a.price.toLocaleString("en-US", { maximumFractionDigits: a.price < 10 ? 4 : 0 })}`, c: pct(a.changePct), up: a.changePct >= 0, col: CRYPTO_COL });
      }

      // XAU/USD + SJC
      if (gold?.xauUsd) {
        const xauRow = (gold.prices ?? []).find((g: any) => g.currency === "USD");
        next.push({ s: "XAU/USD", p: `$${Math.round(gold.xauUsd).toLocaleString("en-US")}`, c: pct(xauRow?.changePercent ?? 0), up: (xauRow?.changePercent ?? 0) >= 0, col: GOLD_COL });
      }
      const sjc = (gold?.prices ?? []).find((g: any) => g.name?.includes("TP.HCM") || g.name?.includes("SJC"));
      if (sjc) next.push({ s: "SJC", p: `${(sjc.sellPrice / 1e6).toFixed(1)}M₫`, c: pct(sjc.changePercent), up: sjc.changePercent >= 0, col: GOLD_COL });

      // VN stocks: VCB, HPG, FPT
      const stocks: any[] = [...(vn?.stocks?.HOSE ?? []), ...(vn?.stocks?.HNX ?? [])];
      for (const sym of ["VCB", "HPG", "FPT"]) {
        const st = stocks.find((x) => x.symbol === sym);
        if (st) next.push({ s: sym, p: `${(st.price / 1000).toFixed(1)}k`, c: pct(st.changePct), up: st.changePct >= 0, col: STOCK_COL });
      }

      // USD/VND
      const fx: any[] = indices?.data?.forex ?? [];
      const usdvnd = fx.find((f) => f.id === "usd-vnd");
      if (usdvnd) next.push({ s: "USD/VND", p: usdvnd.value.toLocaleString("vi-VN"), c: pct(usdvnd.changePct), up: usdvnd.changePct >= 0, col: FX_COL });

      if (!cancelled && next.length > 0) setItems(next);
    }

    load();
    const timer = setInterval(load, 60000); // refresh mỗi 60s
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const loop = [...items, ...items];
  return (
    <div style={{
      overflow: "hidden",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(3,6,18,0.7)",
      height: "36px",
      display: "flex",
      alignItems: "center",
      position: "relative",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "36px", background: "linear-gradient(to right,rgba(5,8,22,1),transparent)", zIndex: 1 }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "36px", background: "linear-gradient(to left,rgba(5,8,22,1),transparent)", zIndex: 1 }} />
      <div className="ticker-run" style={{ display: "flex", width: "max-content" }}>
        {loop.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "9px",
            padding: "0 20px",
            borderRight: "1px solid rgba(255,255,255,0.04)",
            whiteSpace: "nowrap",
          }}>
            <span className="ticker-sym" style={{ color: item.col }}>{item.s}</span>
            <span className="ticker-price">{item.p}</span>
            {item.c && <span className="ticker-chg" style={{ color: item.up ? "#00FFB2" : "#FF4D6D" }}>{item.c}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
