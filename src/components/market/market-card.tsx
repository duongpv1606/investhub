"use client";

import { cn, formatPrice, formatPercent } from "@/lib/utils";
import type { MarketPrice } from "@/types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketCardProps {
  data: MarketPrice;
  onClick?: () => void;
  active?: boolean;
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 80;
    const y = 24 - ((v - min) / range) * 22 - 1;
    return `${x},${y}`;
  }).join(" ");
  const color = positive ? "#00C896" : "#EF4444";
  return (
    <svg width="80" height="26" viewBox="0 0 80 26">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function MarketCard({ data, onClick, active }: MarketCardProps) {
  const isUp = data.changePercent >= 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "card p-4 text-left w-full transition-all hover:border-primary/30 hover:-translate-y-0.5",
        active && "border-primary/60 bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-mono text-muted">{data.symbol}</p>
          <p className="text-sm font-semibold text-white truncate max-w-[120px]">{data.name}</p>
        </div>
        {isUp
          ? <TrendingUp className="h-4 w-4 text-up flex-shrink-0" />
          : <TrendingDown className="h-4 w-4 text-down flex-shrink-0" />
        }
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xl font-bold text-white leading-none">
            {data.type === "gold" && data.currency === "VND"
              ? `${(data.price / 1e6).toFixed(1)}M`
              : formatPrice(data.price, data.currency)
            }
          </p>
          <p className={cn("font-mono text-xs mt-1", isUp ? "text-up" : "text-down")}>
            {formatPercent(data.changePercent)}
          </p>
        </div>
        {data.sparkline && (
          <Sparkline data={data.sparkline} positive={isUp} />
        )}
      </div>
    </button>
  );
}
