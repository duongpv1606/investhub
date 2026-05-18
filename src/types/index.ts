// ============ MARKET TYPES ============

export interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
  currency: string;
  type: "stock" | "crypto" | "gold" | "index";
  sparkline?: number[];
  exchange?: string;
}

export interface VNIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  volume: number;
  advances: number;
  declines: number;
  unchanged: number;
}

export interface VNStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  exchange: "HOSE" | "HNX" | "UPCOM";
  sector?: string;
}

export interface GoldPrice {
  name: string;
  buyPrice: number;
  sellPrice: number;
  change: number;
  changePercent: number;
  updatedAt: string;
  currency: "VND" | "USD";
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  sparkline?: number[];
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  imageUrl?: string;
  source: string;
  category: "stocks" | "gold" | "crypto" | "macro";
  publishedAt: number;
  readTime?: number;
  tags?: string[];
}

export type MarketTab = "vnindex" | "gold" | "btc" | "eth" | "xrp";

export interface TradingViewSymbol {
  symbol: string;
  label: string;
  tab: MarketTab;
}
