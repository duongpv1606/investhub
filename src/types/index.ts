// ============================================
// INVESTHUB - TypeScript Types
// ============================================

export type UserRole = "USER" | "PREMIUM" | "ADMIN";
export type AssetType = "STOCK" | "CRYPTO" | "ETF" | "FOREX";
export type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE";

// Market Data
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  pe: number;
  eps: number;
  week52High: number;
  week52Low: number;
  avgVolume: number;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  volume24h: number;
  priceChangePercent24h: number;
  priceChangePercent7d: number;
  priceChangePercent30d: number;
  sparkline7d: number[];
  circulatingSupply: number;
  totalSupply: number | null;
  ath: number;
  athChangePercent: number;
}

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishedAt: string;
  readTime: number;
  views: number;
  author: { name: string; avatarUrl?: string };
  category: { name: string; slug: string; color?: string };
  tags: string[];
}

// Portfolio
export interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  quantity: number;
  avgBuyPrice: number;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  allocation?: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

// Watchlist
export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  currentPrice?: number;
  changePercent?: number;
  alertPrice?: number;
}

// AI
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Market overview
export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}
