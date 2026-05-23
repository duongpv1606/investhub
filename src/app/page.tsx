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

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #050816)", color: "#E2E8F0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Header />
      <MarketTicker />

      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "20px 20px 40px" }}>

        {/* Hero header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#F1F5F9", margin: 0 }}>
              Tổng quan thị trường
            </h1>
            <p style={{ fontSize: "12px", color: "#475569", margin: "3px 0 0", fontFamily: "monospace" }}>
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "20px", background: "rgba(0,255,178,0.06)", border: "1px solid rgba(0,255,178,0.15)" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FFB2", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#00FFB2", fontWeight: "600" }}>REALTIME</span>
          </div>
        </div>

        {/* Market Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", marginBottom: "20px" }} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {MOCK_MARKET_PRICES.map((p: any) => (
            <MarketCard key={p.symbol} data={p} />
          ))}
        </div>

        {/* Main layout — Chart + Sidebar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", alignItems: "start" }} className="grid-cols-1 lg:grid-cols-[1fr_320px]">

          {/* LEFT — Chart + Table + News */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Chart section */}
            <div style={{
              background: "rgba(15,23,42,0.7)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
            }}>
              {/* Top glow line */}
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(to right, transparent, rgba(0,229,168,0.3), transparent)" }} />
              <TradingViewChart />
            </div>

            {/* Stock table */}
            <div style={{
              background: "rgba(15,23,42,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: "#4D7CFE" }} />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0" }}>Bảng giá chứng khoán</span>
                </div>
                <Link href="/stocks" style={{ fontSize: "11px", color: "#4D7CFE", textDecoration: "none", fontFamily: "monospace" }}>
                  Xem tất cả →
                </Link>
              </div>
              <VNStockTable stocks={MOCK_VN_STOCKS} />
            </div>

            {/* News section */}
            <div style={{
              background: "rgba(15,23,42,0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "16px",
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: "#00E5A8" }} />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#E2E8F0" }}>Tin tức thị trường</span>
                </div>
                <Link href="/news" style={{ fontSize: "11px", color: "#00E5A8", textDecoration: "none", fontFamily: "monospace" }}>
                  Xem tất cả →
                </Link>
              </div>
              <div style={{ padding: "8px" }}>
                <NewsSection />
              </div>
            </div>
          </div>

          {/* RIGHT — Sidebar */}
          <div style={{ position: "sticky", top: "72px" }}>
            <NewsSidebar />
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: "24px",
          background: "rgba(15,23,42,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,229,168,0.15)",
          borderRadius: "16px",
          padding: "32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(to right, transparent, rgba(0,229,168,0.4), transparent)" }} />
          <Bell size={24} color="#00E5A8" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#F1F5F9", marginBottom: "8px" }}>
            Nhận tín hiệu giao dịch miễn phí
          </h2>
          <p style={{ fontSize: "13px", color: "#64748B", marginBottom: "20px", maxWidth: "480px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            Tham gia 10,000+ nhà đầu tư — phân tích thị trường, tín hiệu mua/bán hàng ngày qua Telegram
          </p>
          <a href="https://t.me/investhub_vn" target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 28px", borderRadius: "10px",
              background: "rgba(0,229,168,0.12)", border: "1px solid rgba(0,229,168,0.3)",
              color: "#00E5A8", fontSize: "14px", fontWeight: "600", textDecoration: "none",
              transition: "all 0.2s",
            }}>
            Tham gia Telegram — 100% Miễn phí
          </a>
        </div>
      </main>
    </div>
  );
}
