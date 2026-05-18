"use client";

import { useState } from "react";
import { Star, Plus, Trash2, Bell } from "lucide-react";
import { PriceChart } from "@/components/charts/price-chart";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

const DEFAULT_WATCHLIST = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.30, change: 0.82, type: "STOCK" as const },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 1087.42, change: 4.21, type: "STOCK" as const },
  { symbol: "BTC", name: "Bitcoin", price: 103420, change: -0.40, type: "CRYPTO" as const },
  { symbol: "ETH", name: "Ethereum", price: 3892, change: 2.10, type: "CRYPTO" as const },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -2.10, type: "STOCK" as const },
  { symbol: "SOL", name: "Solana", price: 198, change: 3.80, type: "CRYPTO" as const },
];

export default function WatchlistPage() {
  const [items, setItems] = useState(DEFAULT_WATCHLIST);
  const [selected, setSelected] = useState(DEFAULT_WATCHLIST[0]);

  const remove = (sym: string) => setItems((p) => p.filter((i) => i.symbol !== sym));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black">Watchlist</h1>
          <p className="text-muted text-sm mt-1">Track assets you're interested in</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-background hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Symbol
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-2">
          {items.map((item) => (
            <button key={item.symbol} onClick={() => setSelected(item)}
              className={cn("w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                selected.symbol === item.symbol ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-card-hover"
              )}>
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-warn fill-warn" />
                <div className="text-left">
                  <p className="text-sm font-semibold">{item.symbol}</p>
                  <p className="text-xs text-muted">{item.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-mono text-sm font-bold">{formatCurrency(item.price)}</p>
                  <p className={cn("font-mono text-xs", item.change >= 0 ? "text-primary" : "text-danger")}>{formatPercent(item.change)}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 rounded hover:bg-accent/10 text-muted hover:text-accent transition-colors"><Bell className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); remove(item.symbol); }} className="p-1.5 rounded hover:bg-danger/10 text-muted hover:text-danger transition-colors"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold">{selected.symbol}</h2>
              <p className="text-muted text-sm">{selected.name}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-black">{formatCurrency(selected.price)}</p>
              <p className={cn("font-mono text-sm", selected.change >= 0 ? "text-primary" : "text-danger")}>{formatPercent(selected.change)} today</p>
            </div>
          </div>
          <PriceChart symbol={selected.symbol} price={selected.price} changePercent={selected.change} />
        </div>
      </div>
    </div>
  );
}
