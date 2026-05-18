import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { NewsCard } from "@/components/news/news-card";
import { TelegramCTA } from "@/components/market/sidebar-widgets";
import { MOCK_MARKET_PRICES, MOCK_NEWS, CATEGORY_LABELS, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tin Tức Tài Chính — Chứng khoán, Vàng, Crypto",
  description: "Tin tức tài chính mới nhất — chứng khoán Việt Nam, giá vàng, Bitcoin và thị trường thế giới.",
};

const CATS = ["all", "stocks", "gold", "crypto", "macro"] as const;
type Cat = typeof CATS[number];

export default function NewsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MarketTicker prices={MOCK_MARKET_PRICES} />
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Tin Tức Tài Chính</h1>
          <p className="text-sm text-muted mt-1">Cập nhật từ CafeF, VnExpress, CoinDesk, CoinTelegraph</p>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {CATS.map(cat => (
            <button key={cat}
              className={cn("px-4 py-1.5 rounded-full text-xs font-medium transition-all border",
                cat === "all"
                  ? "bg-primary text-bg border-primary font-bold"
                  : "border-border text-muted hover:text-white hover:border-primary/50"
              )}>
              {cat === "all" ? "Tất cả" : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Featured */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
              {MOCK_NEWS.slice(0, 4).map(a => (
                <NewsCard key={a.id} article={a} variant="featured" />
              ))}
            </div>
            {/* Rest */}
            <div className="card p-4">
              {MOCK_NEWS.slice(4).map(a => (
                <NewsCard key={a.id} article={a} />
              ))}
              {MOCK_NEWS.length === 0 && (
                <p className="text-sm text-muted text-center py-8">Đang tải tin tức...</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-sm font-bold text-white mb-3">Tin nóng trong ngày</h3>
              {MOCK_NEWS.slice(0, 6).map(a => (
                <NewsCard key={a.id} article={a} variant="compact" />
              ))}
            </div>
            <TelegramCTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
