import { MapPin, Calendar } from "lucide-react";
import type { Match } from "@/lib/types";
import { formatKickoff } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface MatchHeaderProps {
  match: Match;
}

export default function MatchHeader({ match }: MatchHeaderProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <div className={cn(
      "panel p-6 mb-6",
      isLive && "border-bb-green/30 bg-gradient-to-b from-bb-green/4 to-transparent"
    )}>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Home team */}
        <div className="flex-1 flex flex-col items-center lg:items-end gap-2">
          <div className="w-20 h-20 rounded-full bg-bb-navy border border-bb-border overflow-hidden flex items-center justify-center">
            {match.homeTeam.flag
              ? <img src={match.homeTeam.flag} alt={match.homeTeam.name} className="w-full h-full object-cover" />
              : <span className="text-2xl font-bold text-bb-text-3">{match.homeTeam.code}</span>
            }
          </div>
          <h2 className="font-display font-bold text-2xl text-bb-text">{match.homeTeam.name}</h2>
          <div className="flex gap-1">
            {match.homeTeam.form.map((r, i) => (
              <span key={i} className={cn(
                "w-6 h-6 rounded text-xs font-mono font-bold flex items-center justify-center",
                r === "W" ? "bg-bb-green/15 text-bb-green" :
                r === "D" ? "bg-bb-gold/15 text-bb-gold" :
                "bg-bb-red/15 text-bb-red"
              )}>{r}</span>
            ))}
          </div>
          <p className="text-bb-text-3 text-xs font-mono">ELO {match.homeTeam.elo}</p>
        </div>

        {/* Center: score + info */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? "live" : isFinished ? "settled" : "open"}>
              {isLive ? `Live ${match.minute}'` : isFinished ? "Full Time" : "Upcoming"}
            </Badge>
            <Badge variant="gray">Group {match.group} · {match.stage}</Badge>
          </div>

          {/* Score */}
          {(isLive || isFinished) ? (
            <div className="flex items-center gap-4">
              <span className={cn("font-display font-bold text-6xl", isLive ? "text-bb-green" : "text-bb-text")}>
                {match.homeScore}
              </span>
              <span className="font-display text-3xl text-bb-text-3">—</span>
              <span className={cn("font-display font-bold text-6xl", isLive ? "text-bb-green" : "text-bb-text")}>
                {match.awayScore}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="font-display font-bold text-4xl text-bb-text-3">VS</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 text-bb-text-3 text-xs font-mono">
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {formatKickoff(match.kickoff)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {match.venue}, {match.city}
            </span>
          </div>
        </div>

        {/* Away team */}
        <div className="flex-1 flex flex-col items-center lg:items-start gap-2">
          <div className="w-20 h-20 rounded-full bg-bb-navy border border-bb-border overflow-hidden flex items-center justify-center">
            {match.awayTeam.flag
              ? <img src={match.awayTeam.flag} alt={match.awayTeam.name} className="w-full h-full object-cover" />
              : <span className="text-2xl font-bold text-bb-text-3">{match.awayTeam.code}</span>
            }
          </div>
          <h2 className="font-display font-bold text-2xl text-bb-text">{match.awayTeam.name}</h2>
          <div className="flex gap-1">
            {match.awayTeam.form.map((r, i) => (
              <span key={i} className={cn(
                "w-6 h-6 rounded text-xs font-mono font-bold flex items-center justify-center",
                r === "W" ? "bg-bb-green/15 text-bb-green" :
                r === "D" ? "bg-bb-gold/15 text-bb-gold" :
                "bg-bb-red/15 text-bb-red"
              )}>{r}</span>
            ))}
          </div>
          <p className="text-bb-text-3 text-xs font-mono">ELO {match.awayTeam.elo}</p>
        </div>
      </div>
    </div>
  );
}
