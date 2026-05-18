import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { NewsCard } from "@/components/news/news-card";
import { TelegramCTA } from "@/components/market/sidebar-widgets";
import { MOCK_MARKET_PRICES, MOCK_GOLD_PRICES, MOCK_NEWS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Giá Vàng Hôm Nay — SJC, DOJI, XAU/USD",
  description: "Giá vàng SJC hôm nay, vàng nhẫn 9999, XAU/USD realtime. Biểu đồ vàng thế giới, tin tức vàng mới nhất.",
};

const goldNews = MOCK_NEWS.filter(n => n.category === "gold");

export default function GoldPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MarketTicker prices={MOCK_MARKET_PRICES} />
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Giá Vàng Hôm Nay</h1>
          <p className="text-sm text-muted mt-1">Giá vàng SJC, vàng nhẫn trong nước và XAU/USD thế giới — cập nhật liên tục</p>
        </div>

        {/* Gold price table */}
        <div className="card overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Bảng giá vàng</h2>
            <span className="text-xs text-muted">Cập nhật: {new Date().toLocaleTimeString("vi-VN")}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-mono text-muted">Loại vàng</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-muted">Mua vào (đ)</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-muted">Bán ra (đ)</th>
                  <th className="px-4 py-3 text-right text-xs font-mono text-muted">Thay đổi</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_GOLD_PRICES.map((g, i) => (
                  <tr key={i} className="border-b border-border/40 hover:bg-card/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🥇</span>
                        <span className="text-sm font-medium text-white">{g.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-sm">
                      {g.currency === "VND"
                        ? `${(g.buyPrice / 1e6).toFixed(1)}M`
                        : `$${g.buyPrice.toLocaleString()}`
                      }
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-sm text-gold">
                      {g.currency === "VND"
                        ? `${(g.sellPrice / 1e6).toFixed(1)}M`
                        : `$${g.sellPrice.toLocaleString()}`
                      }
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("font-mono text-xs", g.changePercent >= 0 ? "text-up" : "text-down")}>
                        {g.changePercent >= 0 ? "+" : ""}{g.changePercent.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TradingViewChart defaultTab="gold" />
            <div>
              <h2 className="text-base font-bold text-white mb-4">Tin tức vàng</h2>
              <div className="card p-4">
                {goldNews.length > 0
                  ? goldNews.map(a => <NewsCard key={a.id} article={a} />)
                  : MOCK_NEWS.slice(0, 4).map(a => <NewsCard key={a.id} article={a} />)
                }
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-sm font-bold text-white mb-3">Lịch sử giá XAU/USD</h3>
              {[
                { period: "1 tuần", change: "+0.8%", up: true },
                { period: "1 tháng", change: "+3.2%", up: true },
                { period: "3 tháng", change: "+8.5%", up: true },
                { period: "6 tháng", change: "+15.2%", up: true },
                { period: "1 năm", change: "+28.4%", up: true },
              ].map(row => (
                <div key={row.period} className="flex justify-between items-center py-2 border-b border-border/40 last:border-none text-sm">
                  <span className="text-muted">{row.period}</span>
                  <span className={row.up ? "text-up font-mono" : "text-down font-mono"}>{row.change}</span>
                </div>
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
