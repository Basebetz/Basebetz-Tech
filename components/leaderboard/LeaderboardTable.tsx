"use client";
import { useState } from "react";
import { TrendingUp, Zap } from "lucide-react";
import type { LeaderboardUser } from "@/lib/types";
import { formatVolume, formatAddress, cn } from "@/lib/utils";

interface LeaderboardTableProps {
  users: LeaderboardUser[];
}

const SORT_KEYS = ["roi", "totalPnl", "totalVolume", "winRate"] as const;
type SortKey = typeof SORT_KEYS[number];

const BADGE_COLORS: Record<string, string> = {
  diamond: "text-bb-teal border-bb-teal/35 bg-bb-teal/8",
  gold:    "text-bb-gold border-bb-gold/35 bg-bb-gold/8",
  silver:  "text-bb-text-2 border-bb-border bg-bb-navy",
  bronze:  "text-[#A05C1A] border-[#A05C1A]/30 bg-[#A05C1A]/8",
  none:    "text-bb-text-3 border-bb-border bg-transparent",
};

const BADGE_ICONS: Record<string, string> = {
  diamond: "💎", gold: "🥇", silver: "🥈", bronze: "🥉", none: "",
};

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="font-display font-bold text-xl text-bb-text-3">#{rank}</span>;
}

export default function LeaderboardTable({ users }: LeaderboardTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("roi");

  const sorted = [...users].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="panel">
      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-bb-border bg-bb-navy/40">
        <span className="text-bb-text-3 text-xs font-mono uppercase tracking-widest mr-2">Sort by</span>
        {(["roi", "totalPnl", "totalVolume", "winRate"] as SortKey[]).map(k => (
          <button
            key={k}
            onClick={() => setSortBy(k)}
            className={cn(
              "px-3 py-1 rounded text-xs font-mono font-medium uppercase tracking-wide transition-all",
              sortBy === k
                ? "bg-bb-blue/10 text-bb-blue border border-bb-blue/25"
                : "text-bb-text-3 hover:text-bb-text border border-transparent hover:border-bb-border hover:bg-bb-navy"
            )}
          >
            {k === "roi" ? "ROI %" : k === "totalPnl" ? "Total P&L" : k === "totalVolume" ? "Volume" : "Win Rate"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bb-border bg-bb-navy/30">
              {["Rank", "Trader", "ROI", "Total P&L", "Volume", "Win Rate", "W/L", "Streak", "Badge"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono text-bb-text-3 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bb-border/60">
            {sorted.map((user, i) => (
              <tr key={user.walletAddress} className={cn(
                "hover:bg-bb-navy/40 transition-colors",
                i < 3 && "bg-bb-blue/[0.02]"
              )}>
                <td className="px-4 py-3 w-16"><RankDisplay rank={user.rank} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{user.avatar}</span>
                    <div>
                      <p className="text-bb-text text-sm font-semibold">{user.displayName}</p>
                      <p className="text-bb-text-3 text-[11px] font-mono">{formatAddress(user.walletAddress)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-bb-green font-mono font-bold text-sm">
                    <TrendingUp size={12} />
                    +{user.roi.toFixed(1)}%
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-bb-green font-semibold">+${(user.totalPnl / 1000).toFixed(1)}K</td>
                <td className="px-4 py-3 font-mono text-sm text-bb-text-2">{formatVolume(user.totalVolume)}</td>
                <td className="px-4 py-3 font-mono text-sm text-bb-text">{(user.winRate * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 font-mono text-xs text-bb-text-2">
                  <span className="text-bb-green">{user.wins}W</span>
                  <span className="text-bb-text-3 mx-1">/</span>
                  <span className="text-bb-red">{user.losses}L</span>
                </td>
                <td className="px-4 py-3">
                  {user.streak > 0 && (
                    <div className="flex items-center gap-1 text-xs font-mono text-bb-gold">
                      <Zap size={11} /> {user.streak}W streak
                    </div>
                  )}
                  {user.streak === 0 && <span className="text-bb-text-3 text-xs font-mono">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 rounded border text-[10px] font-mono uppercase", BADGE_COLORS[user.badge])}>
                    {BADGE_ICONS[user.badge]} {user.badge}
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
