import type { CryptoAsset, StockQuote, OHLCVData, FearGreedData } from "@/types";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query";

// ==================== CRYPTO ====================
export async function getCryptoMarkets(
  page = 1,
  perPage = 50
): Promise<CryptoAsset[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: "true",
    price_change_percentage: "24h,7d,30d",
  });

  const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  if (apiKey) params.set("x_cg_demo_api_key", apiKey);

  const res = await fetch(`${COINGECKO_BASE}/coins/markets?${params}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error("Failed to fetch crypto markets");
  const data = await res.json();

  return data.map((coin: any): CryptoAsset => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    image: coin.image,
    currentPrice: coin.current_price,
    marketCap: coin.market_cap,
    marketCapRank: coin.market_cap_rank,
    volume24h: coin.total_volume,
    priceChangePercent24h: coin.price_change_percentage_24h ?? 0,
    priceChangePercent7d: coin.price_change_percentage_7d_in_currency ?? 0,
    priceChangePercent30d: coin.price_change_percentage_30d_in_currency ?? 0,
    sparkline7d: coin.sparkline_in_7d?.price ?? [],
    circulatingSupply: coin.circulating_supply,
    totalSupply: coin.total_supply,
    ath: coin.ath,
    athChangePercent: coin.ath_change_percentage,
  }));
}

export async function getCoinDetail(coinId: string) {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
    { next: { revalidate: 120 } }
  );
  if (!res.ok) throw new Error(`Failed to fetch coin: ${coinId}`);
  return res.json();
}

export async function getCoinOHLC(coinId: string, days = 7): Promise<number[][]> {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("Failed to fetch OHLC data");
  return res.json();
}

export async function getFearGreedIndex(): Promise<FearGreedData> {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return {
      value: parseInt(data.data[0].value),
      classification: data.data[0].value_classification,
      timestamp: data.data[0].timestamp,
    };
  } catch {
    return { value: 50, classification: "Neutral", timestamp: "" };
  }
}

export async function getGlobalCryptoData() {
  const res = await fetch(`${COINGECKO_BASE}/global`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch global crypto data");
  return res.json();
}

// ==================== STOCKS ====================
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return getMockStockQuote(symbol);

  try {
    const [quoteRes, overviewRes] = await Promise.all([
      fetch(`${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`, {
        next: { revalidate: 60 },
      }),
      fetch(`${ALPHA_VANTAGE_BASE}?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const [quote, overview] = await Promise.all([quoteRes.json(), overviewRes.json()]);
    const q = quote["Global Quote"];
    if (!q || !q["05. price"]) return getMockStockQuote(symbol);

    return {
      symbol: q["01. symbol"],
      name: overview.Name || symbol,
      price: parseFloat(q["05. price"]),
      change: parseFloat(q["09. change"]),
      changePercent: parseFloat(q["10. change percent"].replace("%", "")),
      open: parseFloat(q["02. open"]),
      high: parseFloat(q["03. high"]),
      low: parseFloat(q["04. low"]),
      volume: parseInt(q["06. volume"]),
      marketCap: parseInt(overview.MarketCapitalization || "0"),
      pe: parseFloat(overview.PERatio || "0"),
      eps: parseFloat(overview.EPS || "0"),
      week52High: parseFloat(overview["52WeekHigh"] || "0"),
      week52Low: parseFloat(overview["52WeekLow"] || "0"),
      avgVolume: parseInt(overview["50DayMovingAverage"] || "0"),
    };
  } catch {
    return getMockStockQuote(symbol);
  }
}

// Mock data for development
function getMockStockQuote(symbol: string): StockQuote {
  const mockData: Record<string, Partial<StockQuote>> = {
    AAPL: { name: "Apple Inc.", price: 189.30, changePercent: 0.82 },
    MSFT: { name: "Microsoft Corp.", price: 415.20, changePercent: 1.24 },
    NVDA: { name: "NVIDIA Corp.", price: 1087.42, changePercent: 4.21 },
    TSLA: { name: "Tesla Inc.", price: 248.50, changePercent: -2.10 },
    GOOGL: { name: "Alphabet Inc.", price: 175.20, changePercent: 0.94 },
    META: { name: "Meta Platforms", price: 492.10, changePercent: 1.82 },
    AMZN: { name: "Amazon.com Inc.", price: 184.70, changePercent: 2.41 },
  };

  const base = mockData[symbol] || { name: symbol, price: 100, changePercent: 0 };
  const price = base.price || 100;

  return {
    symbol,
    name: base.name || symbol,
    price,
    change: (price * (base.changePercent || 0)) / 100,
    changePercent: base.changePercent || 0,
    open: price * 0.99,
    high: price * 1.015,
    low: price * 0.985,
    volume: Math.floor(Math.random() * 50_000_000) + 5_000_000,
    marketCap: price * 1_000_000_000,
    pe: 25 + Math.random() * 15,
    eps: price / 30,
    week52High: price * 1.3,
    week52Low: price * 0.7,
    avgVolume: Math.floor(Math.random() * 30_000_000) + 10_000_000,
  };
}
