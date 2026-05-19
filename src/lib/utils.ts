import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MarketPrice, NewsArticle, VNStock, GoldPrice, CryptoAsset } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "USD", compact = false): string {
  if (currency === "VND") {
    if (compact) {
      if (price >= 1e12) return `${(price / 1e12).toFixed(1)}T`;
      if (price >= 1e9) return `${(price / 1e9).toFixed(1)}B`;
      if (price >= 1e6) return `${(price / 1e6).toFixed(0)}M`;
    }
    return new Intl.NumberFormat("vi-VN").format(price);
  }
  if (compact) {
    if (price >= 1e12) return `$${(price / 1e12).toFixed(2)}T`;
    if (price >= 1e9) return `$${(price / 1e9).toFixed(2)}B`;
    if (price >= 1e6) return `$${(price / 1e6).toFixed(2)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: price < 10 ? 4 : 2,
    maximumFractionDigits: price < 10 ? 6 : 2,
  }).format(price);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatVolume(vol: number, currency = "USD"): string {
  if (currency === "VND") {
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(0)}M`;
    return vol.toLocaleString("vi-VN");
  }
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
  return `$${vol.toLocaleString()}`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} ngày trước`;
  if (h > 0) return `${h} giờ trước`;
  if (m > 0) return `${m} phút trước`;
  return "Vừa xong";
}

// ============ MOCK DATA ============

export const MOCK_MARKET_PRICES: MarketPrice[] = [
  { symbol: "VNINDEX", name: "VN-Index", price: 1285.42, change: 12.35, changePercent: 0.97, volume: 18500000000, currency: "VND", type: "index", sparkline: [1260,1265,1258,1272,1268,1275,1280,1285] },
  { symbol: "HNXINDEX", name: "HNX-Index", price: 238.15, change: -1.82, changePercent: -0.76, currency: "VND", type: "index", sparkline: [241,240,239,240,238,239,237,238] },
  { symbol: "SJC", name: "Vàng SJC", price: 110500000, change: 500000, changePercent: 0.45, currency: "VND", type: "gold", sparkline: [109,109.5,110,110.2,110.5,110.3,110.4,110.5] },
  { symbol: "XAUUSD", name: "XAU/USD", price: 3342.80, change: 15.20, changePercent: 0.46, currency: "USD", type: "gold", sparkline: [3320,3325,3330,3335,3338,3340,3342,3343] },
  { symbol: "BTCUSDT", name: "Bitcoin", price: 103420, change: -412.5, changePercent: -0.40, currency: "USD", type: "crypto", sparkline: [104200,103800,103600,103900,103700,103500,103400,103420] },
  { symbol: "ETHUSDT", name: "Ethereum", price: 3892, change: 82.1, changePercent: 2.15, currency: "USD", type: "crypto", sparkline: [3750,3780,3800,3820,3850,3870,3885,3892] },
];

export const MOCK_VN_STOCKS: VNStock[] = [
  { symbol: "VCB", name: "Vietcombank", price: 88500, change: 300, changePercent: 0.34, volume: 4200000, marketCap: 318000000000000, exchange: "HOSE", sector: "Ngân hàng" },
  { symbol: "BID", name: "BIDV", price: 49200, change: -200, changePercent: -0.40, volume: 6800000, marketCap: 215000000000000, exchange: "HOSE", sector: "Ngân hàng" },
  { symbol: "VIC", name: "Vingroup", price: 42500, change: 500, changePercent: 1.19, volume: 3100000, marketCap: 156000000000000, exchange: "HOSE", sector: "Bất động sản" },
  { symbol: "HPG", name: "Hòa Phát", price: 28900, change: 600, changePercent: 2.12, volume: 12500000, marketCap: 95000000000000, exchange: "HOSE", sector: "Thép" },
  { symbol: "FPT", name: "FPT Corp", price: 142000, change: 4500, changePercent: 3.27, volume: 2800000, marketCap: 88000000000000, exchange: "HOSE", sector: "Công nghệ" },
  { symbol: "TCB", name: "Techcombank", price: 24100, change: 375, changePercent: 1.58, volume: 8900000, marketCap: 85000000000000, exchange: "HOSE", sector: "Ngân hàng" },
  { symbol: "VNM", name: "Vinamilk", price: 72000, change: -300, changePercent: -0.41, volume: 1900000, marketCap: 74000000000000, exchange: "HOSE", sector: "Tiêu dùng" },
  { symbol: "MBB", name: "MB Bank", price: 21500, change: -100, changePercent: -0.46, volume: 15200000, marketCap: 72000000000000, exchange: "HOSE", sector: "Ngân hàng" },
  { symbol: "VHM", name: "Vinhomes", price: 35200, change: 300, changePercent: 0.86, volume: 4500000, marketCap: 70000000000000, exchange: "HOSE", sector: "Bất động sản" },
  { symbol: "GAS", name: "PV Gas", price: 82000, change: -500, changePercent: -0.61, volume: 890000, marketCap: 68000000000000, exchange: "HOSE", sector: "Năng lượng" },
];

export const MOCK_GOLD_PRICES: GoldPrice[] = [
  { name: "Vàng SJC (Hà Nội)", buyPrice: 109500000, sellPrice: 110500000, change: 500000, changePercent: 0.45, updatedAt: new Date().toISOString(), currency: "VND" },
  { name: "Vàng SJC (TP.HCM)", buyPrice: 109500000, sellPrice: 110500000, change: 500000, changePercent: 0.45, updatedAt: new Date().toISOString(), currency: "VND" },
  { name: "Vàng nhẫn SJC 9999", buyPrice: 104000000, sellPrice: 105500000, change: 300000, changePercent: 0.29, updatedAt: new Date().toISOString(), currency: "VND" },
  { name: "Vàng DOJI 9999", buyPrice: 103800000, sellPrice: 105200000, change: 200000, changePercent: 0.19, updatedAt: new Date().toISOString(), currency: "VND" },
  { name: "XAU/USD (Thế giới)", buyPrice: 3340, sellPrice: 3345, change: 15.20, changePercent: 0.46, updatedAt: new Date().toISOString(), currency: "USD" },
];

export const MOCK_NEWS: NewsArticle[] = [
  { id: "1", title: "VN-Index tăng mạnh phiên cuối tuần, nhóm ngân hàng dẫn sóng", excerpt: "Thị trường chứng khoán Việt Nam kết thúc tuần giao dịch với sắc xanh áp đảo. VN-Index tăng 12.35 điểm (+0.97%) lên 1.285,42 điểm, thanh khoản đạt 18.500 tỷ đồng.", url: "https://cafef.vn", source: "CafeF", category: "stocks", publishedAt: Date.now() - 3600000, readTime: 3, tags: ["VN-Index", "Ngân hàng"] },
  { id: "2", title: "Giá vàng SJC tăng thêm 500.000đ/lượng, chênh lệch mua-bán thu hẹp", excerpt: "Giá vàng miếng SJC hôm nay được niêm yết ở mức 109,5 triệu đồng/lượng (mua vào) và 110,5 triệu đồng/lượng (bán ra).", url: "https://vnexpress.net", source: "VnExpress", category: "gold", publishedAt: Date.now() - 7200000, readTime: 2, tags: ["Vàng SJC", "Giá vàng"] },
  { id: "3", title: "Bitcoin chạm $104,000 rồi điều chỉnh, nhà đầu tư tổ chức tiếp tục tích lũy", excerpt: "BTC đã có lúc chạm ngưỡng $104,000 trong phiên sáng nay trước khi điều chỉnh nhẹ về $103,420. Dòng tiền từ các ETF Bitcoin spot tiếp tục tích cực.", url: "https://coindesk.com", source: "CoinDesk", category: "crypto", publishedAt: Date.now() - 5400000, readTime: 4, tags: ["BTC", "Bitcoin", "ETF"] },
  { id: "4", title: "FPT báo lãi Q1/2025 tăng 28%, cổ phiếu tăng kịch trần", excerpt: "CTCP FPT công bố kết quả kinh doanh quý I/2025 với doanh thu đạt 16.827 tỷ đồng và lợi nhuận sau thuế 2.456 tỷ đồng, tăng 28% so với cùng kỳ.", url: "https://cafef.vn", source: "CafeF", category: "stocks", publishedAt: Date.now() - 10800000, readTime: 3, tags: ["FPT", "Kết quả kinh doanh"] },
  { id: "5", title: "Ethereum ETF dòng tiền vào đạt $2.1 tỷ trong tuần, kỷ lục mới", excerpt: "Các quỹ ETF Ethereum spot tại Mỹ ghi nhận dòng tiền vào thuần đạt 2,1 tỷ USD trong tuần qua, mức cao nhất kể từ khi ra mắt.", url: "https://cointelegraph.com", source: "CoinTelegraph", category: "crypto", publishedAt: Date.now() - 14400000, readTime: 3, tags: ["ETH", "Ethereum", "ETF"] },
  { id: "6", title: "Fed phát tín hiệu cắt giảm lãi suất có thể sớm hơn dự kiến", excerpt: "Biên bản cuộc họp FOMC mới nhất cho thấy nhiều thành viên ủng hộ việc xem xét cắt giảm lãi suất sớm hơn, khi lạm phát tiến dần về mục tiêu 2%.", url: "https://vnexpress.net", source: "VnExpress", category: "macro", publishedAt: Date.now() - 18000000, readTime: 5, tags: ["Fed", "Lãi suất", "Vĩ mô"] },
];

export const TRADING_VIEW_SYMBOLS = {
  vnindex: "TVC:VNINDEX",
  gold: "TVC:GOLD",
  btc: "BINANCE:BTCUSDT",
  eth: "BINANCE:ETHUSDT",
  xrp: "BINANCE:XRPUSDT",
};

export const CATEGORY_LABELS = {
  stocks: "Chứng khoán",
  gold: "Vàng",
  crypto: "Crypto",
  macro: "Vĩ mô",
};

export const CATEGORY_COLORS = {
  stocks: "text-accent bg-accent/10",
  gold: "text-gold bg-gold/10",
  crypto: "text-primary bg-primary/10",
  macro: "text-purple-400 bg-purple-400/10",
};
