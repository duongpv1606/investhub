import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { NewsCard } from "@/components/news/news-card";
import { TelegramCTA } from "@/components/market/sidebar-widgets";
import { MOCK_NEWS, formatPercent, cn } from "@/lib/utils";
import { getBaseUrl } from "@/lib/base-url";

export const metadata: Metadata = {
  title: "Tiền Điện Tử — Bitcoin, Ethereum, XRP giá hôm nay",
  description: "Giá Bitcoin, Ethereum, XRP hôm nay. Biểu đồ crypto realtime, tin tức crypto mới nhất từ CoinDesk và CoinTelegraph.",
};

export const revalidate = 60;

const cryptoNews = MOCK_NEWS.filter(n => n.category === "crypto");

const MOCK_CRYPTO = [
  { symbol: "BTC", name: "Bitcoin", price: 103420, changePct: -0.4, marketCap: 2040000000000, volume: 42100000000, rank: 1, icon: "₿", color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", price: 3892, changePct: 2.15, marketCap: 467000000000, volume: 18400000000, rank: 2, icon: "Ξ", color: "#627eea" },
  { symbol: "XRP", name: "XRP", price: 2.48, changePct: -1.2, marketCap: 142000000000, volume: 6200000000, rank: 3, icon: "✕", color: "#00aae4" },
];

const MOCK_FG = { value: 74, classification: "Greed", yesterday: 68, yesterdayClass: "Greed" };

function fmtUsdCompact(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

function fgLabelVi(cls: string): string {
  const m: Record<string, string> = {
    "Extreme Fear": "Cực kỳ sợ hãi",
    "Fear": "Sợ hãi",
    "Neutral": "Trung lập",
    "Greed": "Tham lam",
    "Extreme Greed": "Cực kỳ tham lam",
  };
  return m[cls] ?? cls;
}

async function getData() {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/crypto`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    const json = await res.json();
    if (!json.success || !json.assets?.length) throw new Error();
    return { assets: json.assets, fearGreed: json.fearGreed ?? MOCK_FG };
  } catch {
    return { assets: MOCK_CRYPTO, fearGreed: MOCK_FG };
  }
}

export default async function CryptoPage() {
  const { assets, fearGreed } = await getData();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MarketTicker />
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Tiền Điện Tử</h1>
          <p className="text-sm text-muted mt-1">Giá Bitcoin, Ethereum và top altcoins — dữ liệu realtime từ CoinGecko</p>
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
                {assets.map((c: any, i: number) => (
                  <tr key={c.symbol} className="border-b border-border/40 hover:bg-card/50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-xs text-muted font-mono">{c.rank ?? i + 1}</td>
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
                      ${c.price.toLocaleString(undefined, { maximumFractionDigits: c.price < 10 ? 4 : 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-mono text-sm font-semibold px-2 py-0.5 rounded",
                        c.changePct >= 0 ? "text-up bg-up/10" : "text-down bg-down/10")}>
                        {formatPercent(c.changePct)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{c.marketCap ? fmtUsdCompact(c.marketCap) : "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted">{c.volume ? fmtUsdCompact(c.volume) : "—"}</td>
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
                  <div className="text-5xl font-mono font-black text-primary mb-1">{fearGreed.value}</div>
                  <div className="text-sm font-semibold text-primary">{fgLabelVi(fearGreed.classification)}</div>
                  {fearGreed.yesterday != null && (
                    <div className="text-xs text-muted mt-1">Hôm qua: {fearGreed.yesterday} ({fgLabelVi(fearGreed.yesterdayClass)})</div>
                  )}
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
