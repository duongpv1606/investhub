"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpDown, Search } from "lucide-react";
import type { CryptoAsset } from "@/types";
import { formatCurrency, formatNumber, formatPercent, cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/sparkline";

interface CryptoTableProps {
  initialCoins: CryptoAsset[];
}

export function CryptoTable({ initialCoins }: CryptoTableProps) {
  const [coins] = useState(initialCoins);
  const [search, setSearch] = useState("");

  const filtered = coins.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Search className="w-4 h-4 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coins..."
          className="bg-transparent text-sm text-white placeholder:text-muted outline-none flex-1"
        />
        <span className="text-xs font-mono text-muted">{filtered.length} coins</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["#", "Asset", "Price", "24h %", "7d %", "Market Cap", "Volume (24h)", "7d Chart"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider text-muted whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((coin) => (
              <tr key={coin.id} className="border-b border-border/50 hover:bg-card-hover transition-colors cursor-pointer">
                <td className="px-4 py-3 text-sm font-mono text-muted">{coin.marketCapRank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {coin.image && (
                      <Image src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{coin.name}</p>
                      <p className="text-xs font-mono text-muted">{coin.symbol}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm font-semibold">{formatCurrency(coin.currentPrice)}</td>
                <td className={cn("px-4 py-3 font-mono text-sm", coin.priceChangePercent24h >= 0 ? "text-primary" : "text-danger")}>
                  {formatPercent(coin.priceChangePercent24h)}
                </td>
                <td className={cn("px-4 py-3 font-mono text-sm", coin.priceChangePercent7d >= 0 ? "text-primary" : "text-danger")}>
                  {formatPercent(coin.priceChangePercent7d)}
                </td>
                <td className="px-4 py-3 text-sm text-muted">{formatNumber(coin.marketCap)}</td>
                <td className="px-4 py-3 text-sm text-muted">{formatNumber(coin.volume24h)}</td>
                <td className="px-4 py-3">
                  <Sparkline data={coin.sparkline7d} positive={coin.priceChangePercent7d >= 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
