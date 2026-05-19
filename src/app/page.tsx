import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { MarketCard } from "@/components/market/market-card";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { VNStockTable } from "@/components/market/vn-stock-table";
import { NewsCard } from "@/components/news/news-card";
import { TopMovers, HotNews, TelegramCTA, OpenAccountCTA } from "@/components/market/sidebar-widgets";
import { MOCK_MARKET_PRICES, MOCK_VN_STOCKS } from "@/lib/utils";
import { getAllNews } from "@/lib/api/rss";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 300;

export default async function HomePage() {
  // Lấy tin tức thật trực tiếp từ RSS
  let news: any[] = [];
  try {
    news = await getAllNews(20);
  } catch {
    news = [];
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MarketTicker prices={MOCK_MARKET_PRICES} />

      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">

        {/* Hero — Market Cards */}
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
            {MOCK_MARKET_PRICES.map((p: any) => (
              <MarketCard key={p.symbol} data={p} />
            ))}
          </div>
        </section>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left */}
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
              {news.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {news.slice(0, 4).map((a: any) => (
                      <a key={a.id} href={a.sourceUrl || a.url} target="_blank" rel="noopener noreferrer"
                        className="card p-4 group hover:border-primary/30 transition-all block">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                            a.marketType === "crypto" ? "bg-primary/10 text-primary" :
                            a.marketType === "gold" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-blue-500/10 text-blue-400"
                          }`}>
                            {a.marketType === "crypto" ? "Crypto" : a.marketType === "gold" ? "Vàng" : "Chứng khoán"}
                          </span>
                          <span className="text-xs text-muted">{a.sourceName}</span>
                        </div>
                        {a.imageUrl && (
                          <img src={a.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2" loading="lazy" />
                        )}
                        <h3 className="font-semibold text-white text-sm group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {a.title}
                        </h3>
                        <p className="text-xs text-muted mt-1 line-clamp-2">{a.summary}</p>
                        <p className="text-xs text-muted mt-2">
                          {new Date(a.publishedAt).toLocaleString("vi-VN")}
                        </p>
                      </a>
                    ))}
                  </div>
                  <div className="card p-4 mt-3 divide-y divide-border/50">
                    {news.slice(4, 12).map((a: any) => (
                      <a key={a.id} href={a.sourceUrl || a.url} target="_blank" rel="noopener noreferrer"
                        className="flex gap-3 py-3 group">
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                            a.marketType === "crypto" ? "bg-primary/10 text-primary" :
                            a.marketType === "gold" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-blue-500/10 text-blue-400"
                          }`}>
                            {a.sourceName}
                          </span>
                          <p className="text-sm font-medium text-white group-hover:text-primary transition-colors line-clamp-2 mt-1">
                            {a.title}
                          </p>
                          <p className="text-xs text-muted mt-1">
                            {new Date(a.publishedAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        {a.imageUrl && (
                          <img src={a.imageUrl} alt="" className="w-16 h-14 object-cover rounded-lg flex-shrink-0" loading="lazy" />
                        )}
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <div className="card p-8 text-center text-muted text-sm">
                  Đang tải tin tức...
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Hot news sidebar */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-down animate-pulse" />
                Tin nóng
              </h3>
              <div className="divide-y divide-border/50">
                {news.slice(0, 6).map((a: any) => (
                  <a key={a.id} href={a.sourceUrl || a.url} target="_blank" rel="noopener noreferrer"
                    className="block py-2.5 group">
                    <p className="text-xs font-medium text-white group-hover:text-primary transition-colors line-clamp-2">
                      {a.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{a.sourceName} · {new Date(a.publishedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
                  </a>
                ))}
              </div>
            </div>
            <TopMovers stocks={MOCK_VN_STOCKS} type="up" />
            <TopMovers stocks={MOCK_VN_STOCKS} type="down" />
            <TelegramCTA />
            <OpenAccountCTA />
          </div>
        </div>

        {/* CTA */}
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
