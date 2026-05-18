"use client";

import { TrendingUp, Activity, Zap } from "lucide-react";
import type { FearGreedData } from "@/types";
import { cn } from "@/lib/utils";

interface GlobalStatsProps {
  fearGreed: FearGreedData | null;
}

export function GlobalStats({ fearGreed }: GlobalStatsProps) {
  const fgValue = fearGreed?.value || 74;
  const fgClass = fearGreed?.classification || "Greed";
  const fgColor = fgValue >= 70 ? "#00C896" : fgValue >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-muted" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted">Global Market Cap</p>
        </div>
        <p className="font-mono text-2xl font-bold">$2.18T</p>
        <p className="text-xs text-primary mt-1">▲ +2.4% (24h)</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-muted" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted">24h Volume</p>
        </div>
        <p className="font-mono text-2xl font-bold">$98.4B</p>
        <p className="text-xs text-primary mt-1">▲ +8.1% vs yesterday</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-muted" />
          <p className="text-xs font-mono uppercase tracking-widest text-muted">Fear & Greed</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="font-mono text-2xl font-bold" style={{ color: fgColor }}>{fgValue}</p>
          <div>
            <p className="font-semibold text-sm" style={{ color: fgColor }}>{fgClass}</p>
            <p className="text-xs text-muted">vs 68 yesterday</p>
          </div>
          <svg width="56" height="36" className="ml-auto" viewBox="0 0 56 36">
            <defs>
              <linearGradient id="fg-gradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#00C896" />
              </linearGradient>
            </defs>
            <path d="M4 30 A24 24 0 0 1 52 30" fill="none" stroke="#1E2D45" strokeWidth="5" />
            <path d="M4 30 A24 24 0 0 1 52 30" fill="none" stroke="url(#fg-gradient)" strokeWidth="5" />
            <line x1="28" y1="30" x2={28 + 18 * Math.cos(Math.PI - (fgValue / 100) * Math.PI)} y2={30 - 18 * Math.sin((fgValue / 100) * Math.PI)} stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="28" cy="30" r="3" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}
