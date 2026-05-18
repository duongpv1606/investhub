"use client";

import { useState } from "react";
import { cn, formatPercent } from "@/lib/utils";
import type { VNStock } from "@/types";
import { ArrowUpDown, Search } from "lucide-react";

interface VNStockTableProps {
  stocks: VNStock[];
}

type SortKey = "symbol" | "price" | "changePercent" | "volume" | "marketCap";

export function VNStockTable({ stocks }: VNStockTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterEx, setFilterEx] = useState<"ALL" | "HOSE" | "HNX" | "UPCOM">("ALL");

  const filtered = stocks
    .filter(s => {
      const matchSearch = s.symbol.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase());
      const matchEx = filterEx === "ALL" || s.exchange === filterEx;
      return matchSearch && matchEx;
    })
    .sort((a, b) => {
      const v = sortDir === "asc" ? 1 : -1;
      if (sortKey === "symbol") return v * a.symbol.localeCompare(b.symbol);
      return v * ((a[sortKey] as number) - (b[sortKey] as number));
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const fmtMktCap = (v: number) => {
    if (v >= 1e12) return `${(v/1e12).toFixed(0)}T`;
    if (v >= 1e9) return `${(v/1e9).toFixed(0)}B`;
    return `${(v/1e6).toFixed(0)}M`;
  };

  return (
    <div className="card overflow-hidden">
      {/* Filters */}
      <div className="flex items-center gap-3 p-4 border-b border-border flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã, tên..."
            className="w-full rounded-lg border border-border bg-surface pl-8 pr-3 py-2 text-xs text-white placeholder:text-muted outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-1">
          {(["ALL","HOSE","HNX","UPCOM"] as const).map(ex => (
            <button key={ex} onClick={() => setFilterEx(ex)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-mono transition-colors",
                filterEx === ex ? "bg-primary text-bg font-bold" : "text-muted hover:text-white hover:bg-card"
              )}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[
                { key: "symbol", label: "Mã CK" },
                { key: "price", label: "Giá (đ)" },
                { key: "changePercent", label: "% Thay đổi" },
                { key: "volume", label: "KL" },
                { key: "marketCap", label: "Vốn hóa" },
              ].map(col => (
                <th key={col.key}
                  onClick={() => toggleSort(col.key as SortKey)}
                  className="px-3 py-2.5 text-left text-xs font-mono text-muted cursor-pointer hover:text-white select-none whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              ))}
              <th className="px-3 py-2.5 text-left text-xs font-mono text-muted">Sàn</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(stock => (
              <tr key={stock.symbol} className="border-b border-border/40 hover:bg-card/50 transition-colors cursor-pointer">
                <td className="px-3 py-3">
                  <div className="font-mono font-bold text-white text-sm">{stock.symbol}</div>
                  <div className="text-xs text-muted truncate max-w-[100px]">{stock.name}</div>
                </td>
                <td className="px-3 py-3 font-mono font-semibold text-sm">
                  {(stock.price/1000).toFixed(1)}
                </td>
                <td className="px-3 py-3">
                  <span className={cn(
                    "font-mono text-sm font-semibold px-2 py-0.5 rounded",
                    stock.changePercent > 0 ? "text-up bg-up/10" :
                    stock.changePercent < 0 ? "text-down bg-down/10" : "text-muted"
                  )}>
                    {formatPercent(stock.changePercent)}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-muted font-mono">
                  {stock.volume >= 1e6 ? `${(stock.volume/1e6).toFixed(1)}M` : `${(stock.volume/1e3).toFixed(0)}K`}
                </td>
                <td className="px-3 py-3 text-xs text-muted font-mono">
                  {fmtMktCap(stock.marketCap)}
                </td>
                <td className="px-3 py-3">
                  <span className={cn("text-xs font-mono px-2 py-0.5 rounded",
                    stock.exchange === "HOSE" ? "bg-accent/10 text-accent" :
                    stock.exchange === "HNX" ? "bg-gold/10 text-gold" : "bg-muted/10 text-muted"
                  )}>
                    {stock.exchange}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
