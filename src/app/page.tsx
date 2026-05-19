import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { MarketCard } from "@/components/market/market-card";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { VNStockTable } from "@/components/market/vn-stock-table";
import { NewsCard } from "@/components/news/news-card";
import { TopMovers, HotNews, TelegramCTA, OpenAccountCTA } from "@/components/market/sidebar-widgets";
import { MOCK_MARKET_PRICES, MOCK_VN_STOCKS, MOCK_NEWS } from "@/lib/utils";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const news = MOCK_NEWS;
  const prices = MOCK_MARKET_PRICES;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MarketTicker prices={prices} />

      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">

        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">Tổng quan thị trường</h1>
              <p className="text-xs text-muted mt-0.5">
                Dữ liệu cập nhật liên tục — {new Date().toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              LIVE
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {prices.map((p: any) => (
              <MarketCard key={p.symbol} data={p} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TradingViewChart />

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Bảng giá chứng khoán</h2>
                <Link href="/stocks" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  Xem thêm <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <VNStockTable stocks={MOCK_VN_STOCKS} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white">Tin tức mới nhất</h2>
                <Link href="/news" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  Tất cả tin <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {news.slice(0, 4).map((a: any) => (
                  <NewsCard key={a.id} article={a} variant="featured" />
                ))}
              </div>
              <div className="card p-4 mt-3">
                {news.slice(4, 10).map((a: any) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <HotNews articles={news} />
            <TopMovers stocks={MOCK_VN_STOCKS} type="up" />
            <TopMovers stocks={MOCK_VN_STOCKS} type="down" />
            <TelegramCTA />
            <OpenAccountCTA />
          </div>
        </div>

        <section className="mt-10 card p-6 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-accent/20 text-center">
          <div className="max-w-xl mx-auto">
            <Bell className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">Nhận tín hiệu giao dịch miễn phí</h2>
            <p className="text-sm text-muted mb-4">
              Tham gia cộng đồng 10,000+ nhà đầu tư — nhận phân tích thị trường, tín hiệu mua/bán qua Telegram
            </p>
            <a href="https://t.me/investhub_vn" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-bg hover:bg-primary/90 transition-colors">
              Tham gia Telegram — 100% Miễn phí
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
