"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend } from "recharts";
import type { PortfolioItem } from "@/types";
import { MOCK_PORTFOLIO } from "@/lib/mock-data";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

const CURRENT_PRICES: Record<string, number> = {
  BTC: 103420, ETH: 3892, NVDA: 1087, AAPL: 189.30, SOL: 198, MSFT: 415.20,
};

const COLORS = ["#00C896", "#3B82F6", "#76b900", "#F59E0B", "#9945ff", "#00a4ef"];

function generatePerfData() {
  const data = [];
  let v = 100000;
  for (let i = 0; i < 90; i++) {
    v += (Math.random() - 0.44) * v * 0.015;
    data.push({ day: i, value: Math.round(v) });
  }
  return data;
}

export default function PortfolioPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [items, setItems] = useState(MOCK_PORTFOLIO);
  const perfData = useMemo(generatePerfData, []);

  const enriched = items.map((item) => {
    const current = CURRENT_PRICES[item.symbol] || item.avgBuyPrice;
    const currentValue = item.quantity * current;
    const costBasis = item.quantity * item.avgBuyPrice;
    return { ...item, currentPrice: current, currentValue, costBasis, gainLoss: currentValue - costBasis, gainLossPercent: ((currentValue - costBasis) / costBasis) * 100 };
  });

  const total = enriched.reduce((s, i) => s + i.currentValue, 0);
  const totalCost = enriched.reduce((s, i) => s + i.costBasis, 0);
  const totalGain = total - totalCost;

  const pieData = enriched.map((item, i) => ({
    name: item.symbol,
    value: parseFloat(((item.currentValue / total) * 100).toFixed(1)),
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black">Portfolio Tracker</h1>
          <p className="text-muted text-sm mt-1">Track your investments in real-time</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-background hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Value", value: formatCurrency(total), icon: Wallet, color: "text-white" },
          { label: "Total Cost", value: formatCurrency(totalCost), icon: PieChart, color: "text-muted" },
          { label: "Total P&L", value: formatCurrency(totalGain), icon: totalGain >= 0 ? TrendingUp : TrendingDown, color: totalGain >= 0 ? "text-primary" : "text-danger" },
          { label: "Return", value: formatPercent((totalGain / totalCost) * 100), icon: totalGain >= 0 ? TrendingUp : TrendingDown, color: totalGain >= 0 ? "text-primary" : "text-danger" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-muted" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted">{stat.label}</p>
            </div>
            <p className={cn("font-mono text-xl font-bold", stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Holdings */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
          <h2 className="font-display font-bold mb-4">Holdings</h2>
          <div className="space-y-0 divide-y divide-border">
            {enriched.map((item) => {
              const alloc = (item.currentValue / total) * 100;
              return (
                <div key={item.id} className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[enriched.indexOf(item) % COLORS.length] }} />
                      <div>
                        <p className="text-sm font-semibold">{item.symbol}</p>
                        <p className="text-xs text-muted">{item.quantity} units · avg {formatCurrency(item.avgBuyPrice)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">{formatCurrency(item.currentValue)}</p>
                      <p className={cn("font-mono text-xs", item.gainLossPercent >= 0 ? "text-primary" : "text-danger")}>
                        {formatPercent(item.gainLossPercent)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${alloc}%`, background: COLORS[enriched.indexOf(item) % COLORS.length] }} />
                    </div>
                    <span className="text-xs font-mono text-muted w-12 text-right">{alloc.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h2 className="font-display font-bold mb-4">Allocation</h2>
          <RPieChart width={280} height={260}>
            <Pie data={pieData} dataKey="value" cx={130} cy={110} outerRadius={90} innerRadius={50} paddingAngle={2}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Legend formatter={(value) => <span className="text-xs text-muted">{value}</span>} />
            <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ background: "#151B28", border: "1px solid #1E2D45", borderRadius: "8px", fontSize: "12px" }} />
          </RPieChart>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-display font-bold mb-4">Portfolio Performance (90 days)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={perfData}>
            <defs>
              <linearGradient id="perf-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00C896" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#00C896" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip contentStyle={{ background: "#151B28", border: "1px solid #1E2D45", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatCurrency(v), "Value"]} />
            <Area type="monotone" dataKey="value" stroke="#00C896" strokeWidth={2} fill="url(#perf-grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
