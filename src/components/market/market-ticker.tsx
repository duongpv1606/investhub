"use client";

import { cn, formatPrice, formatPercent } from "@/lib/utils";
import type { MarketPrice } from "@/types";

interface MarketTickerProps {
  prices: MarketPrice[];
}

export function MarketTicker({ prices }: MarketTickerProps) {
  const items = [...prices, ...prices];

  return (
    <div className="overflow-hidden border-b border-border bg-card/50 h-9 flex items-center">
      <div className="flex gap-6 animate-ticker" style={{ width: "max-content" }}>
        {items.map((p, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap text-xs">
            <span className="font-mono font-bold text-white">{p.symbol}</span>
            <span className="font-mono text-muted">{formatPrice(p.price, p.currency)}</span>
            <span className={cn("font-mono", p.changePercent >= 0 ? "text-up" : "text-down")}>
              {formatPercent(p.changePercent)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
