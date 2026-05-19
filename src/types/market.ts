// ============ MARKET TYPES ============

export type MarketType = "stock" | "gold" | "crypto";
export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w";

export interface MarketPrice {
  symbol: string;
  displayName: string;
  marketType: MarketType;
  price: number;
  changePercent: number;
  change: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  marketCap?: number;
  source: string;
  timestamp: number;
  currency: "USD" | "VND";
  sparkline?: number[];
}

export interface OHLCData {
  symbol: string;
  timeframe: Timeframe;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsArticle {
  id: string;
  marketType: MarketType | "macro";
  title: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: number;
  slug: string;
  tags?: string[];
}

export interface GoldPrice {
  name: string;
  buyPrice: number;
  sellPrice: number;
  changePercent: number;
  currency: "VND" | "USD";
  source: string;
  updatedAt: number;
}

export interface MarketOverview {
  prices: MarketPrice[];
  updatedAt: number;
}

export interface SymbolMapping {
  symbol: string;
  displayName: string;
  marketType: MarketType;
  tradingviewSymbol: string;
  coinGeckoId?: string;
  binanceSymbol?: string;
}

// VN Stocks
export interface VNStockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  totalValue: number;
  high: number;
  low: number;
  open: number;
  exchange: "HOSE" | "HNX" | "UPCOM";
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  source: string;
  cached: boolean;
  timestamp: number;
  error?: string;
}
