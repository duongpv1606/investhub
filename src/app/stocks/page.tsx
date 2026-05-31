import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketTicker } from "@/components/market/market-ticker";
import { TradingViewChart } from "@/components/charts/tradingview-chart";
import { VNStockTable } from "@/components/market/vn-stock-table";
import { NewsCard } from "@/components/news/news-card";
import { TopMovers, TelegramCTA } from "@/components/market/sidebar-widgets";
import { MOCK_VN_STOCKS, MOCK_NEWS } from "@/lib/utils";
import { getBaseUrl } from "@/lib/base-url";

export const metadata: Metadata = {
  title: "Chứng khoán Việt Nam — VN-Index, HNX, UPCOM",
  description: "Bảng giá chứng khoán Việt Nam realtime. VN-Index, HNX-Index, top cổ phiếu, biểu đồ TradingView.",
};

export const revalidate = 60;

const stockNews = MOCK_NEWS.filter(n => n.category === "stocks");

// Số định dạng kiểu VN: 1.285,42
function fmtVN(n: number, dp = 2) {
  return n.toLocaleString("vi-VN", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

async function getData() {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/vn-stocks?type=overview`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    const json = await res.json();
    if (!json.success) throw new Error();

    const hose = json.stocks?.HOSE || [];
    const hnx = json.stocks?.HNX || [];
    const all = [...hose, ...hnx].map((s: any) => ({
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

    const indices = (json.indices || []).map((i: any) => ({
      name: i.name,
      value: fmtVN(i.value),
      change: `${i.change >= 0 ? "+" : ""}${fmtVN(i.change)}`,
      pct: `${i.changePct >= 0 ? "+" : ""}${fmtVN(i.changePct)}%`,
      up: i.change >= 0,
    }));

    return {
      stocks: all.length > 0 ? all : MOCK_VN_STOCKS,
      indices: indices.length > 0 ? indices : MOCK_INDICES,
    };
  } catch {
    return { stocks: MOCK_VN_STOCKS, indices: MOCK_INDICES };
  }
}

const MOCK_INDICES = [
  { name: "VN-Index", value: "1.285,42", change: "+12,35", pct: "+0,97%", up: true },
  { name: "HNX-Index", value: "238,15", change: "-1,82", pct: "-0,76%", up: false },
  { name: "UPCOM", value: "95,28", change: "+0,45", pct: "+0,47%", up: true },
];

export default async function StocksPage() {
  const { stocks, indices } = await getData();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MarketTicker />
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Chứng khoán Việt Nam</h1>
          <p className="text-sm text-muted mt-1">Dữ liệu VN-Index, HNX-Index, UPCOM — cập nhật realtime trong giờ giao dịch</p>
        </div>

        {/* Index summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {indices.map((idx: any) => (
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
              <VNStockTable stocks={stocks} />
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
            <TopMovers stocks={stocks} type="up" />
            <TopMovers stocks={stocks} type="down" />
            <TelegramCTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
