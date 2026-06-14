"use client";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Market } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface PriceChartProps {
  market: Market;
}

const RANGES = ["6H", "24H", "48H", "ALL"] as const;

export default function PriceChart({ market }: PriceChartProps) {
  const [range, setRange] = useState<typeof RANGES[number]>("24H");

  const now = Date.now();
  const rangeMs: Record<string, number> = {
    "6H":  6  * 3600 * 1000,
    "24H": 24 * 3600 * 1000,
    "48H": 48 * 3600 * 1000,
    "ALL": Infinity,
  };

  const filtered = market.priceHistory
    .filter(p => range === "ALL" || p.t >= now - rangeMs[range])
    .map(p => ({
      time: p.t,
      Home: parseFloat((p.home * 100).toFixed(1)),
      Draw: parseFloat((p.draw * 100).toFixed(1)),
      Away: parseFloat((p.away * 100).toFixed(1)),
    }));

  const isBinary = market.outcomes.length === 2;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: number }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="panel border border-bb-blue/20 p-3 text-xs font-mono shadow-card">
        <p className="text-bb-text-3 mb-2">{label ? format(new Date(label), "HH:mm · d MMM") : ""}</p>
        {payload.map(p => (
          <div key={p.name} className="flex justify-between gap-4" style={{ color: p.color }}>
            <span>{p.name}</span>
            <span className="font-bold">{p.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Probability Chart</h3>
          <p className="text-bb-text-3 text-xs font-mono">Implied probability over time</p>
        </div>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-2 py-1 text-xs font-mono rounded transition-all",
                range === r ? "bg-bb-blue/10 text-bb-blue border border-bb-blue/25" : "text-bb-text-3 hover:text-bb-text hover:bg-bb-navy"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cHome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0052FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0052FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cDraw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8920D" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#B8920D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cAway" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D41F45" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#D41F45" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickFormatter={(t) => format(new Date(t), "HH:mm")}
              tick={{ fill: "#7B8FB5", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={v => `${v}%`}
              tick={{ fill: "#7B8FB5", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Home" stroke="#0052FF" strokeWidth={2} fill="url(#cHome)" dot={false} />
            {!isBinary && <Area type="monotone" dataKey="Draw" stroke="#B8920D" strokeWidth={1.5} fill="url(#cDraw)" dot={false} />}
            <Area type="monotone" dataKey="Away" stroke="#D41F45" strokeWidth={2} fill="url(#cAway)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Outcome labels */}
      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="w-3 h-0.5 bg-bb-blue rounded" />
          <span className="text-bb-text-2">{market.outcomes[0]?.shortLabel}</span>
        </div>
        {!isBinary && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="w-3 h-0.5 bg-bb-gold rounded" />
            <span className="text-bb-text-2">Draw</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="w-3 h-0.5 bg-bb-red rounded" />
          <span className="text-bb-text-2">{market.outcomes[market.outcomes.length - 1]?.shortLabel}</span>
        </div>
      </div>
    </div>
  );
}
