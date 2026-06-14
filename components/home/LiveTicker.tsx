"use client";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";
import { format } from "date-fns";
import type { Match } from "@/lib/types";

interface TickerItem {
  label: string;
  value: string;
  change: string;
  color: string;
}

function buildTickerItems(matches: Match[]): TickerItem[] {
  const items: TickerItem[] = [];

  for (const m of matches.filter(m => m.status === "live" || m.status === "halftime")) {
    items.push({
      label: `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`,
      value: `${m.homeScore ?? 0}–${m.awayScore ?? 0}`,
      change: m.status === "halftime" ? "HT" : `${m.minute ?? 0}'`,
      color: "text-bb-green",
    });
  }

  const upcoming = matches
    .filter(m => m.status === "scheduled")
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
    .slice(0, 8);

  for (const m of upcoming) {
    items.push({
      label: `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`,
      value: format(new Date(m.kickoff), "MMM d"),
      change: `Group ${m.group}`,
      color: "text-white/80",
    });
  }

  for (const m of matches.filter(m => m.status === "finished").slice(0, 4)) {
    items.push({
      label: `${m.homeTeam.shortName} vs ${m.awayTeam.shortName}`,
      value: `${m.homeScore}–${m.awayScore}`,
      change: "FT",
      color: "text-white/50",
    });
  }

  if (items.length === 0) {
    items.push(
      { label: "FIFA WORLD CUP 2026", value: "48 Teams", change: "USA · MEX · CAN", color: "text-bb-blue" },
      { label: "TOURNAMENT STARTS",   value: "Jun 11",   change: "Group Stage",     color: "text-bb-gold" },
      { label: "BASE NETWORK",        value: "USDC",     change: "Onchain",          color: "text-bb-teal" },
    );
  }

  return items;
}

export default function LiveTicker({ matches }: { matches: Match[] }) {
  const items = buildTickerItems(matches);
  const doubled = [...items, ...items];

  return (
    <div className="w-full border-y border-bb-border overflow-hidden" style={{ background: "#090F1E" }}>
      <div className="flex">
        <div className="flex-shrink-0 flex items-center gap-2 px-4 border-r border-white/8 bg-bb-green/10" style={{ minWidth: 100 }}>
          <span className="live-dot !w-1.5 !h-1.5 flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            <Radio size={10} className="text-bb-green" />
            <span className="text-bb-green font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Live</span>
          </div>
        </div>

        <div className="ticker-wrapper flex-1 py-2.5">
          <div className="ticker-track">
            {doubled.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-5">
                <span className="text-white/35 text-[10px] font-mono uppercase tracking-widest">{item.label}</span>
                <span className={cn("font-mono font-bold text-[13px]", item.color)}>{item.value}</span>
                <span className={cn(
                  "font-mono text-[10px]",
                  item.change.startsWith("+") ? "text-bb-green"
                    : item.change.endsWith("'") ? "text-bb-green"
                    : item.change === "FT" ? "text-white/40"
                    : "text-bb-text-3"
                )}>
                  {item.change}
                </span>
                <span className="text-white/12 ml-1 select-none">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
