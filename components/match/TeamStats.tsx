import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TeamStatsProps {
  home: Team;
  away: Team;
}

function StatRow({ label, home, away, higherIsBetter = true }: {
  label: string;
  home: number;
  away: number;
  higherIsBetter?: boolean;
}) {
  const total = home + away || 1;
  const homeW = home / total;
  const awayW = away / total;
  const homeWins = higherIsBetter ? home > away : home < away;
  const awayWins = higherIsBetter ? away > home : away < home;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className={cn("font-semibold", homeWins ? "text-bb-blue" : "text-bb-text-2")}>{home}</span>
        <span className="text-bb-text-3">{label}</span>
        <span className={cn("font-semibold", awayWins ? "text-bb-blue" : "text-bb-text-2")}>{away}</span>
      </div>
      <div className="flex h-1.5 rounded overflow-hidden gap-px">
        <div className="bg-bb-blue/50 rounded-l" style={{ width: `${homeW * 100}%` }} />
        <div className="bg-bb-navy flex-1" style={{ width: `${(1 - homeW - awayW) * 100}%` }} />
        <div className="bg-bb-blue/25 rounded-r" style={{ width: `${awayW * 100}%` }} />
      </div>
    </div>
  );
}

export default function TeamStats({ home, away }: TeamStatsProps) {
  return (
    <div className="panel p-5">
      <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm mb-4">Team Intelligence</h3>

      {/* Team names */}
      <div className="flex justify-between text-xs font-mono text-bb-text-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bb-navy border border-bb-border overflow-hidden flex items-center justify-center">
            {home.flag
              ? <img src={home.flag} alt={home.shortName} className="w-full h-full object-cover" />
              : <span className="text-xs font-bold">{home.code}</span>
            }
          </div>
          <span className="font-semibold">{home.shortName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{away.shortName}</span>
          <div className="w-8 h-8 rounded-full bg-bb-navy border border-bb-border overflow-hidden flex items-center justify-center">
            {away.flag
              ? <img src={away.flag} alt={away.shortName} className="w-full h-full object-cover" />
              : <span className="text-xs font-bold">{away.code}</span>
            }
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <StatRow label="ELO Rating"    home={home.elo}           away={away.elo} />
        <StatRow label="Goals Scored"  home={home.goalsFor}      away={away.goalsFor} />
        <StatRow label="Goals Conceded" home={home.goalsAgainst} away={away.goalsAgainst} higherIsBetter={false} />
        <StatRow label="Points"        home={home.points}        away={away.points} />
      </div>

      {/* Form */}
      <div className="mt-4 pt-4 border-t border-bb-border">
        <p className="text-bb-text-3 text-[10px] font-mono uppercase tracking-widest mb-3">Recent Form (last 5)</p>
        <div className="flex justify-between">
          <div className="flex gap-1">
            {home.form.map((r, i) => (
              <span key={i} className={cn(
                "w-7 h-7 rounded text-xs font-mono font-bold flex items-center justify-center",
                r === "W" ? "bg-bb-green/12 text-bb-green" :
                r === "D" ? "bg-bb-gold/12 text-bb-gold" :
                "bg-bb-red/12 text-bb-red"
              )}>{r}</span>
            ))}
          </div>
          <div className="flex gap-1">
            {away.form.map((r, i) => (
              <span key={i} className={cn(
                "w-7 h-7 rounded text-xs font-mono font-bold flex items-center justify-center",
                r === "W" ? "bg-bb-green/12 text-bb-green" :
                r === "D" ? "bg-bb-gold/12 text-bb-gold" :
                "bg-bb-red/12 text-bb-red"
              )}>{r}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
