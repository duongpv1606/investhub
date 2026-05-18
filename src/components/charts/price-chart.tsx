"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const PERIODS = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

function generateChartData(period: string, basePrice: number) {
  const points = { "1D": 24, "1W": 7, "1M": 30, "3M": 90, "1Y": 365, ALL: 730 }[period] || 30;
  const volatility = basePrice * 0.02;
  const data = [];
  let price = basePrice * 0.88;

  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.47) * volatility;
    price = Math.max(price, basePrice * 0.6);
    data.push({
      time: i,
      price: parseFloat(price.toFixed(2)),
    });
  }
  return data;
}

interface PriceChartProps {
  symbol: string;
  price: number;
  changePercent: number;
  color?: string;
}

export function PriceChart({ symbol, price, changePercent, color = "#00C896" }: PriceChartProps) {
  const [period, setPeriod] = useState("1M");
  const data = generateChartData(period, price);
  const isPositive = changePercent >= 0;
  const chartColor = isPositive ? "#00C896" : "#EF4444";

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono transition-all",
              period === p
                ? "bg-primary text-background font-bold"
                : "text-muted hover:text-white hover:bg-card-hover"
            )}
          >
            {p}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={["auto", "auto"]} hide />
          <Tooltip
            contentStyle={{ background: "#151B28", border: "1px solid #1E2D45", borderRadius: "8px", fontSize: "12px" }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, symbol]}
            labelFormatter={() => ""}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            strokeWidth={2}
            fill={`url(#gradient-${symbol})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
