"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MARKET_INDICES } from "@/lib/mock-data";
import { formatNumber, formatPercent, cn } from "@/lib/utils";

export function MarketOverview() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {MARKET_INDICES.map((index, i) => (
        <motion.div
          key={index.symbol}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{index.name}</p>
              <p className="text-xs font-mono text-muted">{index.symbol}</p>
            </div>
            {index.changePercent >= 0
              ? <TrendingUp className="h-4 w-4 text-primary" />
              : <TrendingDown className="h-4 w-4 text-danger" />
            }
          </div>
          <p className="font-mono text-xl font-bold text-white">{index.value.toLocaleString()}</p>
          <p className={cn("font-mono text-xs mt-1", index.changePercent >= 0 ? "text-primary" : "text-danger")}>
            {formatPercent(index.changePercent)} today
          </p>
        </motion.div>
      ))}
    </div>
  );
}
