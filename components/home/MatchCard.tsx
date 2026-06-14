import Link from "next/link";
import { Clock, TrendingUp, MapPin } from "lucide-react";
import type { Match } from "@/lib/types";
import { formatKickoff, formatVolume } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  featured?: boolean;
  /** When provided, the card uses this football image as background with gradient overlay */
  bgImage?: string;
  /** Completed matches — card is display-only, no navigation */
  nonClickable?: boolean;
}

export default function MatchCard({ match, featured, bgImage, nonClickable }: MatchCardProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isScheduled = match.status === "scheduled";
  const hasImg = !!bgImage;

  const CardWrapper = ({ children }: { children: React.ReactNode }) =>
    nonClickable ? (
      <div className="block h-full">{children}</div>
    ) : (
      <Link href={`/match/${match.id}`} className="block h-full">{children}</Link>
    );

  return (
    <CardWrapper>
      <div
        className={cn(
          "relative overflow-hidden transition-all duration-200 rounded-xl",
          nonClickable ? "cursor-default" : "cursor-pointer",
          hasImg
            ? !nonClickable && "hover:scale-[1.02] hover:shadow-xl"
            : [
                "panel p-5",
                !nonClickable && "panel-hover",
                isLive && "border-bb-green/30",
                featured && "border-bb-blue/25",
              ]
        )}
      >
        {/* Background image + gradient (image-mode only) */}
        {hasImg && (
          <>
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#0D1524",
              }}
            />
            {/* Gradient: lighter at top (image shows), thicker at bottom (text readable) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.72) 100%)",
              }}
            />
          </>
        )}

        {/* Inner content — padded in image-mode */}
        <div className={cn("relative z-10 flex flex-col h-full", hasImg && "p-4")}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? "live" : isFinished ? "settled" : "open"}>
                {isLive ? `LIVE ${match.minute}'` : isFinished ? "FT" : "Upcoming"}
              </Badge>
              <Badge variant="gray">Group {match.group}</Badge>
            </div>
            <span
              className={cn(
                "text-xs font-mono flex items-center gap-1",
                hasImg ? "text-white/65" : "text-bb-text-3"
              )}
            >
              <MapPin size={10} /> {match.city}
            </span>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between gap-3 flex-1">
            {/* Home */}
            <div className="flex-1 flex flex-col items-start">
              <div
                className={cn(
                  "w-11 h-11 rounded-full overflow-hidden flex items-center justify-center mb-1",
                  hasImg
                    ? "bg-white/15 backdrop-blur-sm border border-white/25"
                    : "bg-bb-navy border border-bb-border"
                )}
              >
                {match.homeTeam.flag
                  ? <img src={match.homeTeam.flag} alt={match.homeTeam.shortName} className="w-full h-full object-cover" />
                  : <span className="text-xl">{match.homeTeam.code}</span>
                }
              </div>
              <span
                className={cn(
                  "font-heading font-bold text-base leading-tight",
                  hasImg ? "text-white" : "text-bb-text"
                )}
                style={hasImg ? { textShadow: "0 1px 4px rgba(0,0,0,0.6)" } : undefined}
              >
                {match.homeTeam.shortName}
              </span>
              <div className="flex gap-0.5 mt-1">
                {match.homeTeam.form.map((r, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-[9px] font-mono font-bold",
                      r === "W" ? "form-w" : r === "D" ? "form-d" : "form-l"
                    )}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center">
              {isFinished || isLive ? (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-display font-bold text-3xl",
                      isLive ? "text-bb-green" : hasImg ? "text-white" : "text-bb-text"
                    )}
                  >
                    {match.homeScore}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-lg",
                      hasImg ? "text-white/40" : "text-bb-text-3"
                    )}
                  >
                    –
                  </span>
                  <span
                    className={cn(
                      "font-display font-bold text-3xl",
                      isLive ? "text-bb-green" : hasImg ? "text-white" : "text-bb-text"
                    )}
                  >
                    {match.awayScore}
                  </span>
                </div>
              ) : (
                <span
                  className={cn(
                    "font-heading font-bold text-xl",
                    hasImg ? "text-white/50" : "text-bb-text-3"
                  )}
                >
                  VS
                </span>
              )}

              {isScheduled && (
                <span
                  className={cn(
                    "text-xs font-mono mt-1 flex items-center gap-1",
                    hasImg ? "text-white/80" : "text-bb-blue"
                  )}
                >
                  <Clock size={10} />
                  <CountdownTimer target={match.kickoff} />
                </span>
              )}
              {isScheduled && (
                <span
                  className={cn(
                    "text-[10px] font-mono mt-0.5",
                    hasImg ? "text-white/55" : "text-bb-text-3"
                  )}
                >
                  {formatKickoff(match.kickoff).split("·")[1]?.trim()}
                </span>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-end">
              <div
                className={cn(
                  "w-11 h-11 rounded-full overflow-hidden flex items-center justify-center mb-1",
                  hasImg
                    ? "bg-white/15 backdrop-blur-sm border border-white/25"
                    : "bg-bb-navy border border-bb-border"
                )}
              >
                {match.awayTeam.flag
                  ? <img src={match.awayTeam.flag} alt={match.awayTeam.shortName} className="w-full h-full object-cover" />
                  : <span className="text-xl">{match.awayTeam.code}</span>
                }
              </div>
              <span
                className={cn(
                  "font-heading font-bold text-base leading-tight",
                  hasImg ? "text-white" : "text-bb-text"
                )}
                style={hasImg ? { textShadow: "0 1px 4px rgba(0,0,0,0.6)" } : undefined}
              >
                {match.awayTeam.shortName}
              </span>
              <div className="flex gap-0.5 mt-1">
                {match.awayTeam.form.map((r, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-[9px] font-mono font-bold",
                      r === "W" ? "form-w" : r === "D" ? "form-d" : "form-l"
                    )}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer — stats only, never navigates */}
          <div
            className={cn(
              "mt-4 pt-3 flex items-center justify-between",
              hasImg ? "border-t border-white/20" : "border-t border-bb-border"
            )}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: "default" }}
          >
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-mono",
                hasImg ? "text-white/65" : "text-bb-text-3"
              )}
            >
              <TrendingUp size={11} />
              <span>{formatVolume(match.totalVolume)} vol</span>
            </div>
            <span
              className={cn(
                "text-xs font-mono",
                hasImg ? "text-white/65" : "text-bb-text-3"
              )}
            >
              {match.marketCount} {match.marketCount === 1 ? "market" : "markets"}
            </span>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
