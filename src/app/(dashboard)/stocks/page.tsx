"use client";

import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Star } from "lucide-react";
import { PriceChart } from "@/components/charts/price-chart";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

const TOP_STOCKS = [
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 1087.42, change: 4.21, marketCap: "2.68T", sector: "Technology", color: "#76b900" },
  { symbol: "AAPL", name: "Apple Inc.", price: 189.30, change: 0.82, marketCap: "2.94T", sector: "Technology", color: "#888" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 415.20, change: 1.24, marketCap: "3.08T", sector: "Technology", color: "#00a4ef" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -2.10, marketCap: "789B", sector: "Auto", color: "#e82127" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 175.20, change: 0.94, marketCap: "2.18T", sector: "Technology", color: "#4285f4" },
  { symbol: "META", name: "Meta Platforms", price: 492.10, change: 1.82, marketCap: "1.25T", sector: "Technology", color: "#0668e1" },
  { symbol: "AMZN", name: "Amazon.com", price: 184.70, change: 2.41, marketCap: "1.92T", sector: "E-Commerce", color: "#ff9900" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", price: 371.00, change: -0.30, marketCap: "820B", sector: "Finance", color: "#b5995a" },
  { symbol: "JPM", name: "JPMorgan Chase", price: 196.80, change: 0.54, marketCap: "568B", sector: "Finance", color: "#005eb8" },
  { symbol: "V", name: "Visa Inc.", price: 278.40, change: 0.38, marketCap: "573B", sector: "Finance", color: "#1a1f71" },
];

export default function StocksPage() {
  const [selected, setSelected] = useState(TOP_STOCKS[0]);
  const [search, setSearch] = useState("");
  const [watchlist, setWatchlist] = useState<string[]>(["AAPL", "NVDA"]);

  const filtered = TOP_STOCKS.filter((s) =>
    s.symbol.includes(search.toUpperCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleWatch = (sym: string) => {
    setWatchlist((prev) => prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black">Stock Dashboard</h1>
        <p className="text-muted text-sm mt-1">Search and analyze any stock with AI-powered insights</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Stock List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stocks..."
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            {filtered.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => setSelected(stock)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                  selected.symbol === stock.symbol
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80 hover:bg-card-hover"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-bold" style={{ background: `${stock.color}22`, color: stock.color }}>
                    {stock.symbol.slice(0, 3)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{stock.symbol}</p>
                    <p className="text-xs text-muted">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold">{formatCurrency(stock.price)}</p>
                    <p className={cn("font-mono text-xs", stock.change >= 0 ? "text-primary" : "text-danger")}>
                      {formatPercent(stock.change)}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleWatch(stock.symbol); }}>
                    <Star className={cn("w-3.5 h-3.5", watchlist.includes(stock.symbol) ? "fill-warn text-warn" : "text-muted")} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-mono font-bold" style={{ background: `${selected.color}22`, color: selected.color }}>
                    {selected.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold">{selected.symbol}</h2>
                    <p className="text-sm text-muted">{selected.name} · {selected.sector}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-black">{formatCurrency(selected.price)}</p>
                <div className={cn("flex items-center justify-end gap-1 text-sm font-mono", selected.change >= 0 ? "text-primary" : "text-danger")}>
                  {selected.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {formatPercent(selected.change)} today
                </div>
              </div>
            </div>
            <PriceChart
              symbol={selected.symbol}
              price={selected.price}
              changePercent={selected.change}
              color={selected.color}
            />
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
              {[
                { label: "Open", value: formatCurrency(selected.price * 0.991) },
                { label: "52W High", value: formatCurrency(selected.price * 1.32) },
                { label: "52W Low", value: formatCurrency(selected.price * 0.68) },
                { label: "Market Cap", value: selected.marketCap },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xs text-muted">{stat.label}</p>
                  <p className="font-mono text-sm font-semibold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
