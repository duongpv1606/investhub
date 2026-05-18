import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { NewsCard } from "@/components/news/news-card";
import { TelegramCTA } from "@/components/market/sidebar-widgets";
import { MOCK_MARKET_PRICES, MOCK_NEWS, formatPercent, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tiền Điện Tử — Bitcoin, Ethereum, XRP giá hôm nay",
  description: "Giá Bitcoin, Ethereum, XRP hôm nay. Biểu đồ crypto realtime, tin tức crypto mới nhất từ CoinDesk và CoinTelegraph.",
};

const cryptoNews = MOCK_NEWS.filter(n => n.category === "crypto");

const CRYPTO_LIST = [
  { symbol: "BTC", name: "Bitcoin", price: 103420, change: -0.40, mkt: "$2.04T", vol: "$42.1B", icon: "₿", color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", price: 3892, change: 2.15, mkt: "$467B", vol: "$18.4B", icon: "Ξ", color: "#627eea" },
  { symbol: "XRP", name: "XRP", price: 2.48, change: -1.20, mkt: "$142B", vol: "$6.2B", icon: "✕", color: "#00aae4" },
  { symbol: "SOL", name: "Solana", price: 198, change: 3.80, mkt: "$91B", vol: "$4.8B", icon: "◎", color: "#9945ff" },
  { symbol: "BNB", name: "BNB", price: 682, change: 1.40, mkt: "$99B", vol: "$2.1B", icon: "B", color: "#f3ba2f" },
  { symbol: "ADA", name: "Cardano", price: 1.12, change: 0.60, mkt: "$39B", vol: "$1.1B", icon: "₳", color: "#0033ad" },
];

export default function CryptoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MarketTicker prices={MOCK_MARKET_PRICES} />
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Tiền Điện Tử</h1>
          <p className="text-sm text-muted mt-1">Giá Bitcoin, Ethereum và top altcoins — dữ liệu realtime từ Binance</p>
        </div>

        {/* Crypto overview */}
        <div className="card overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-bold text-white">Market Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Tài sản", "Giá (USD)", "24h %", "Vốn hóa", "Khối lượng"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRYPTO_LIST.map((c, i) => (
                  <tr key={c.symbol} className="border-b border-border/40 hover:bg-card/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-xs text-muted font-mono">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: `${c.color}22`, color: c.color }}>
                          {c.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{c.name}</div>
                          <div className="text-xs text-muted font-mono">{c.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-sm">
                      ${c.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-mono text-sm font-semibold px-2 py-0.5 rounded",
                        c.change >= 0 ? "text-up bg-up/10" : "text-down bg-down/10")}>
                        {formatPercent(c.change)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{c.mkt}</td>
                    <td className="px-4 py-3 text-xs text-muted">{c.vol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TradingViewChart defaultTab="btc" />
            <div>
              <h2 className="text-base font-bold text-white mb-4">Tin tức Crypto</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cryptoNews.slice(0, 4).map(a => (
                  <NewsCard key={a.id} article={a} variant="featured" />
                ))}
              </div>
              <div className="card p-4 mt-3">
                {MOCK_NEWS.slice(0, 4).map(a => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-sm font-bold text-white mb-3">Fear & Greed Index</h3>
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="text-5xl font-mono font-black text-primary mb-1">74</div>
                  <div className="text-sm font-semibold text-primary">Tham lam</div>
                  <div className="text-xs text-muted mt-1">Hôm qua: 68 (Tham lam)</div>
                </div>
              </div>
            </div>
            <TelegramCTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
