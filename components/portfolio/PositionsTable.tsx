"use client";
import { useState } from "react";
import Link from "next/link";
import { ExternalLink, ChevronRight } from "lucide-react";
import type { Position } from "@/lib/types";
import { formatUSDC, pnlColor, pnlSign, cn } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface PositionsTableProps {
  positions: Position[];
}

const TABS = ["All", "Open", "Settled", "Claimable"] as const;

export default function PositionsTable({ positions }: PositionsTableProps) {
  const [tab, setTab] = useState<typeof TABS[number]>("All");

  const filtered = positions.filter(p => {
    if (tab === "Open")      return p.status === "open";
    if (tab === "Settled")   return p.status === "settled";
    if (tab === "Claimable") return p.claimable;
    return true;
  });

  return (
    <div className="panel">
      {/* Tabs */}
      <div className="flex border-b border-bb-border px-4 pt-4 gap-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-heading font-semibold uppercase tracking-wide rounded-t transition-all",
              tab === t
                ? "bg-bb-blue/10 text-bb-blue border border-b-0 border-bb-blue/25"
                : "text-bb-text-3 hover:text-bb-text hover:bg-bb-navy"
            )}
          >
            {t}
            <span className="ml-1.5 text-[10px] font-mono bg-bb-navy px-1 rounded">
              {positions.filter(p =>
                t === "All" ? true :
                t === "Open" ? p.status === "open" :
                t === "Settled" ? p.status === "settled" :
                p.claimable
              ).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bb-border bg-bb-navy/50">
              {["Market", "Position", "Shares", "Entry", "Current", "P&L", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-mono text-bb-text-3 uppercase tracking-widest whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bb-border/60">
            {filtered.map((pos) => (
              <tr key={pos.id} className="hover:bg-bb-navy/40 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-bb-text text-sm font-medium max-w-[200px] truncate">{pos.marketQuestion}</p>
                  <p className="text-bb-text-3 text-xs font-mono mt-0.5">
                    <Link href={`/match/${pos.matchId}`} className="hover:text-bb-blue flex items-center gap-1">
                      View match <ExternalLink size={9} />
                    </Link>
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className={cn("text-sm font-heading font-bold uppercase",
                      pos.outcome.toLowerCase().includes("yes") || pos.outcome === "USA" || pos.outcome === "Brazil" || pos.outcome === "Argentina" || pos.outcome === "France" || pos.outcome === "England"
                        ? "text-bb-green" : "text-bb-blue"
                    )}>{pos.outcome}</span>
                    <Badge variant={pos.side === "YES" ? "green" : "red"} size="sm">{pos.side}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-bb-text-2">{pos.shares.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm text-bb-text-2">${pos.entryPrice.toFixed(3)}</td>
                <td className="px-4 py-3 font-mono text-sm text-bb-text font-semibold">${pos.currentPrice.toFixed(3)}</td>
                <td className="px-4 py-3">
                  <p className={cn("font-mono text-sm font-bold", pnlColor(pos.pnl))}>
                    {pnlSign(pos.pnl)}${formatUSDC(Math.abs(pos.pnl))}
                  </p>
                  <p className={cn("font-mono text-[11px]", pnlColor(pos.pnlPercent))}>
                    {pnlSign(pos.pnlPercent)}{Math.abs(pos.pnlPercent).toFixed(1)}%
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={pos.status === "settled" ? "settled" : pos.status === "open" ? "open" : "gray"}>
                    {pos.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {pos.claimable ? (
                    <Button variant="green" size="sm">
                      Claim ${pos.claimAmount}
                    </Button>
                  ) : pos.status === "open" ? (
                    <Link href={`/match/${pos.matchId}`}>
                      <Button variant="ghost" size="sm">
                        Trade <ChevronRight size={12} />
                      </Button>
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <p className="text-bb-text-3 text-sm font-mono">No positions found.</p>
                  <Link href="/" className="text-bb-blue text-sm hover:underline mt-2 inline-block">Browse markets →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
