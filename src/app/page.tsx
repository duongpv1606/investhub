import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { MarketCard } from "@/components/market/market-card";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { VNStockTable } from "@/components/market/vn-stock-table";
import { NewsSidebar } from "@/components/market/sidebar-widgets";
import { NewsSection } from "@/components/news/news-section";
import { MOCK_MARKET_PRICES, MOCK_VN_STOCKS } from "@/lib/utils";
import { getBaseUrl } from "@/lib/base-url";
import { Bell } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

async function getMarketPrices() {
  const baseUrl = await getBaseUrl();

  // Gọi song song 3 nguồn: vn-stocks (chỉ số VN), gold, crypto
  const [vnRes, goldRes, cryptoRes] = await Promise.allSettled([
    fetch(`${baseUrl}/api/vn-stocks?type=overview`, { next: { revalidate: 60 } }).then(r => r.json()),
    fetch(`${baseUrl}/api/gold`, { next: { revalidate: 300 } }).then(r => r.json()),
    fetch(`${baseUrl}/api/crypto`, { next: { revalidate: 60 } }).then(r => r.json()),
  ]);

  const vn = vnRes.status === "fulfilled" ? vnRes.value : null;
  const gold = goldRes.status === "fulfilled" ? goldRes.value : null;
  const crypto = cryptoRes.status === "fulfilled" ? cryptoRes.value : null;

  const cards: any[] = [];

  // VN-Index + VN30 từ chỉ số VN
  const vnIndices: any[] = vn?.indices ?? [];
  const findIdx = (name: string) => vnIndices.find((i) => i.name === name);
  for (const [name, label] of [["VN-Index", "VN-Index"], ["VN30", "VN30"]] as const) {
    const idx = findIdx(name);
    if (idx) {
      cards.push({ symbol: name === "VN-Index" ? "VNINDEX" : "VN30", displayName: label, price: idx.value, change: idx.change, changePercent: idx.changePct, type: "index", currency: "VND" });
    }
  }

  // SJC + XAU/USD từ gold
  const goldPrices: any[] = gold?.prices ?? [];
  const sjc = goldPrices.find((g: any) => g.name?.includes("TP.HCM")) || goldPrices.find((g: any) => g.currency === "VND");
  if (sjc) cards.push({ symbol: "SJC", displayName: "Vàng SJC", price: sjc.sellPrice, change: 0, changePercent: sjc.changePercent ?? 0, type: "gold", currency: "VND" });
  const xau = goldPrices.find((g: any) => g.currency === "USD");
  if (xau) cards.push({ symbol: "GOLD", displayName: "Vàng (XAU/USD)", price: xau.sellPrice, change: 0, changePercent: xau.changePercent ?? 0, type: "gold", currency: "USD" });

  // BTC + ETH từ crypto
  const assets: any[] = crypto?.assets ?? [];
  for (const sym of ["BTC", "ETH"]) {
    const a = assets.find((x: any) => x.symbol === sym);
    if (a) cards.push({ symbol: sym, displayName: a.name, price: a.price, change: 0, changePercent: a.changePct ?? 0, type: "crypto", currency: "USD" });
  }

  return cards.length >= 6 ? cards.slice(0, 6) : (cards.length > 0 ? cards : MOCK_MARKET_PRICES);
}

async function getVNStocks() {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/vn-stocks?type=overview`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    const json = await res.json();
    if (!json.success) throw new Error();
    const hose = json.stocks?.HOSE || [];
    const hnx = json.stocks?.HNX || [];
    const all = [...hose, ...hnx];
    if (all.length === 0) return MOCK_VN_STOCKS;
    return all.map((s: any) => ({
      symbol: s.symbol,
      name: s.name || s.symbol,
      price: s.price,
      change: s.change,
      changePercent: s.changePct,
      volume: s.volume,
      marketCap: s.marketCap || 0,
      exchange: s.exchange,
      sector: s.sector || "",
    }));
  } catch { return MOCK_VN_STOCKS; }
}

// Shared styles
const S = {
  panel: {
    background: "var(--card-bg)",
    backdropFilter: "blur(14px)" as any,
    WebkitBackdropFilter: "blur(14px)" as any,
    border: "1px solid var(--card-border)",
    borderRadius: "16px",
    overflow: "hidden" as any,
    boxShadow: "var(--shadow)",
  },
  panelHeader: {
    padding: "14px 18px",
    borderBottom: "1px solid var(--border)",
    display: "flex" as any,
    alignItems: "center" as any,
    justifyContent: "space-between" as any,
  },
  panelTitle: {
    display: "flex" as any,
    alignItems: "center" as any,
    gap: "8px",
  },
  accentBar: (color: string) => ({
    width: "3px", height: "15px", borderRadius: "2px", background: color,
  }),
  sectionTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text-heading)",
    letterSpacing: "-0.1px",
  },
  linkMore: (color: string) => ({
    fontSize: "11px",
    color,
    textDecoration: "none" as any,
    fontFamily: "'JetBrains Mono',monospace",
    fontWeight: 500,
    letterSpacing: "0.2px",
  }),
};

export default async function HomePage() {
  const [marketPrices, vnStocks] = await Promise.all([getMarketPrices(), getVNStocks()]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Header />
      <MarketTicker />

      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "20px 20px 52px", position: "relative", zIndex: 1 }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h1 style={{
              fontSize: "19px", fontWeight: 600, color: "var(--text-heading)", margin: 0,
              letterSpacing: "-0.3px", fontFamily: "'Sora','Inter',sans-serif",
            }}>
              Tổng quan thị trường
            </h1>
            <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: "4px 0 0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.2px" }}>
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 13px", borderRadius: "20px", background: "rgba(0,255,178,0.06)", border: "1px solid rgba(0,255,178,0.18)" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FFB2", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono',monospace", color: "#00FFB2", fontWeight: 600, letterSpacing: "0.5px" }}>REALTIME</span>
          </div>
        </div>

        {/* Market Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "10px", marginBottom: "20px" }} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {marketPrices.map((p: any) => (
            <MarketCard key={p.symbol} data={p} />
          ))}
        </div>

        {/* Main layout: Chart + Sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 350px", gap: "16px", alignItems: "start" }} className="grid-cols-1 lg:grid-cols-[1fr_350px]">

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Chart */}
            <div style={{ ...S.panel, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: "1px", background: "linear-gradient(to right,transparent,rgba(0,229,168,0.35),transparent)" }} />
              <div style={{ position: "absolute", top: "13px", right: "15px", display: "flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: "rgba(0,255,178,.07)", border: "1px solid rgba(0,255,178,.18)", zIndex: 5 }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00FFB2", animation: "pulse 2s ease infinite" }} />
                <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono',monospace", color: "#00FFB2", fontWeight: 600, letterSpacing: "0.5px" }}>LIVE</span>
              </div>
              <TradingViewChart />
            </div>

            {/* Stock table */}
            <div style={S.panel}>
              <div style={S.panelHeader}>
                <div style={S.panelTitle}>
                  <div style={S.accentBar("#4D7CFE")} />
                  <span style={S.sectionTitle}>Bảng giá chứng khoán</span>
                </div>
                <Link href="/stocks" style={S.linkMore("#4D7CFE")}>Xem tất cả →</Link>
              </div>
              <VNStockTable stocks={vnStocks} />
            </div>

            {/* News section */}
            <div style={S.panel}>
              <div style={S.panelHeader}>
                <div style={S.panelTitle}>
                  <div style={S.accentBar("#00E5A8")} />
                  <span style={S.sectionTitle}>Tin tức thị trường</span>
                </div>
                <Link href="/news" style={S.linkMore("#00E5A8")}>Xem tất cả →</Link>
              </div>
              <div style={{ padding: "12px" }}>
                <NewsSection />
              </div>
            </div>
          </div>

          {/* RIGHT — sticky sidebar */}
          <div style={{ position: "sticky", top: "70px" }}>
            <NewsSidebar />
          </div>
        </div>

        {/* CTA Banner */}
        <div style={{
          marginTop: "24px",
          background: "var(--card-bg)",
          backdropFilter: "blur(14px)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "36px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--shadow)",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right,transparent,rgba(0,229,168,.5),transparent)" }} />
          <Bell size={24} color="#00E5A8" style={{ margin: "0 auto 12px" }} />
          <h2 style={{
            fontSize: "22px", fontWeight: 700, color: "var(--text-heading)", marginBottom: "10px",
            letterSpacing: "-0.4px", fontFamily: "'Sora','Inter',sans-serif",
          }}>
            Nhận tín hiệu giao dịch miễn phí
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: "20px", maxWidth: "460px", margin: "0 auto 20px", lineHeight: "1.7" }}>
            Tham gia 10,000+ nhà đầu tư — phân tích thị trường, tín hiệu mua/bán hàng ngày qua Telegram
          </p>
          <a href="https://t.me/markethub_vn" target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "11px 28px", borderRadius: "10px",
              background: "rgba(0,229,168,.12)", border: "1px solid rgba(0,229,168,.28)",
              color: "#00E5A8", fontSize: "14px", fontWeight: 600, textDecoration: "none",
              letterSpacing: "0.1px",
            }}>
            Tham gia Telegram — 100% Miễn phí
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
