import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { VNStockTable } from "@/components/market/vn-stock-table";
import { NewsCard } from "@/components/news/news-card";
import { TopMovers, TelegramCTA } from "@/components/market/sidebar-widgets";
import { MOCK_MARKET_PRICES, MOCK_VN_STOCKS, MOCK_NEWS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Chứng khoán Việt Nam — VN-Index, HNX, UPCOM",
  description: "Bảng giá chứng khoán Việt Nam realtime. VN-Index, HNX-Index, top cổ phiếu, biểu đồ TradingView.",
};

const stockNews = MOCK_NEWS.filter(n => n.category === "stocks");

export default function StocksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MarketTicker prices={MOCK_MARKET_PRICES} />
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Chứng khoán Việt Nam</h1>
          <p className="text-sm text-muted mt-1">Dữ liệu VN-Index, HNX-Index, UPCOM — cập nhật realtime trong giờ giao dịch</p>
        </div>

        {/* Index summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { name: "VN-Index", value: "1.285,42", change: "+12,35", pct: "+0,97%", up: true },
            { name: "HNX-Index", value: "238,15", change: "-1,82", pct: "-0,76%", up: false },
            { name: "UPCOM", value: "95,28", change: "+0,45", pct: "+0,47%", up: true },
          ].map(idx => (
            <div key={idx.name} className="card p-4">
              <div className="text-xs text-muted mb-1">{idx.name}</div>
              <div className="text-2xl font-mono font-bold text-white">{idx.value}</div>
              <div className={`text-sm font-mono mt-1 ${idx.up ? "text-up" : "text-down"}`}>
                {idx.change} ({idx.pct})
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TradingViewChart defaultTab="vnindex" />
            <div>
              <h2 className="text-base font-bold text-white mb-4">Bảng giá cổ phiếu</h2>
              <VNStockTable stocks={MOCK_VN_STOCKS} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white mb-4">Tin tức chứng khoán</h2>
              <div className="card p-4">
                {stockNews.map(a => <NewsCard key={a.id} article={a} />)}
                {stockNews.length === 0 && <p className="text-sm text-muted text-center py-4">Chưa có tin tức mới</p>}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <TopMovers stocks={MOCK_VN_STOCKS} type="up" />
            <TopMovers stocks={MOCK_VN_STOCKS} type="down" />
            <TelegramCTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
