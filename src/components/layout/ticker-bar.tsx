"use client";

import { MOCK_TICKERS } from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function TickerBar() {
  const items = [...MOCK_TICKERS, ...MOCK_TICKERS];

  return (
    <div className="border-b border-border bg-card overflow-hidden ticker-pause">
      <div className="flex gap-8 animate-ticker" style={{ width: "max-content" }}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap py-2.5 px-1">
            <span className="font-mono text-xs font-bold text-white">{item.symbol}</span>
            <span className="font-mono text-xs text-muted">{formatCurrency(item.price)}</span>
            <span className={cn("font-mono text-xs", item.change >= 0 ? "text-primary" : "text-danger")}>
              {formatPercent(item.change)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
