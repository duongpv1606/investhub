import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { MarketCard } from "@/components/market/market-card";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { VNStockTable } from "@/components/market/vn-stock-table";
import { NewsSidebar } from "@/components/market/sidebar-widgets";
import { NewsSection } from "@/components/news/news-section";
import { MOCK_MARKET_PRICES, MOCK_VN_STOCKS } from "@/lib/utils";
import { Bell } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

async function getMarketPrices() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/indices`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error();
    const json = await res.json();
    if (!json.success) throw new Error();
    const { forex, gold, crypto } = json.data;
    const mapped = [
      ...forex.map((i: any) => ({ symbol: i.id, name: i.name, price: i.value, change: i.change, changePct: i.changePct, unit: i.unit || "", category: "forex" })),
      ...gold.slice(0, 2).map((i: any) => ({ symbol: i.id, name: i.name, price: i.value, change: i.change, changePct: i.changePct, unit: i.unit || "", category: "gold" })),
      ...crypto.slice(0, 2).map((i: any) => ({ symbol: i.id, name: i.name, price: i.value, change: i.change, changePct: i.changePct, unit: i.unit || "USD", category: "crypto" })),
    ];
    return mapped.slice(0, 6);
  } catch { return MOCK_MARKET_PRICES; }
}

async function getVNStocks() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/vn-stocks?type=overview`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    const json = await res.json();
    if (!json.success) throw new Error();
    const hose = json.stocks?.HOSE || [];
    return hose.map((s: any) => ({ symbol: s.symbol, name: s.symbol, price: s.price, change: s.change, changePct: s.changePct, volume: s.volume, high: s.high, low: s.low, exchange: s.exchange }));
  } catch { return MOCK_VN_STOCKS; }
}

// Shared styles
const S = {
  panel: {
    background: "rgba(15,23,42,0.82)",
    backdropFilter: "blur(14px)" as any,
    WebkitBackdropFilter: "blur(14px)" as any,
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    overflow: "hidden" as any,
  },
  panelHeader: {
    padding: "14px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
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
    color: "#E2E8F0",
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
    <div style={{ minHeight: "100vh", background: "var(--bg,#050816)", color: "#E2E8F0", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <Header />
      <MarketTicker />

      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "20px 20px 52px", position: "relative", zIndex: 1 }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h1 style={{
              fontSize: "19px", fontWeight: 600, color: "#F1F5F9", margin: 0,
              letterSpacing: "-0.3px", fontFamily: "'Sora','Inter',sans-serif",
            }}>
              Tổng quan thị trường
            </h1>
            <p style={{ fontSize: "12px", color: "#334155", margin: "4px 0 0", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.2px" }}>
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
          background: "rgba(15,23,42,0.82)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(0,229,168,0.16)",
          borderRadius: "16px",
          padding: "36px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right,transparent,rgba(0,229,168,.5),transparent)" }} />
          <Bell size={24} color="#00E5A8" style={{ margin: "0 auto 12px" }} />
          <h2 style={{
            fontSize: "22px", fontWeight: 700, color: "#F1F5F9", marginBottom: "10px",
            letterSpacing: "-0.4px", fontFamily: "'Sora','Inter',sans-serif",
          }}>
            Nhận tín hiệu giao dịch miễn phí
          </h2>
          <p style={{ fontSize: "13.5px", color: "#475569", marginBottom: "20px", maxWidth: "460px", margin: "0 auto 20px", lineHeight: "1.7" }}>
            Tham gia 10,000+ nhà đầu tư — phân tích thị trường, tín hiệu mua/bán hàng ngày qua Telegram
          </p>
          <a href="https://t.me/investhub_vn" target="_blank" rel="noopener noreferrer"
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
