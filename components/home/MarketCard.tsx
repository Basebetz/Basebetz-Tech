import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Market, Match } from "@/lib/types";
import { formatVolume } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import ProbabilityBar from "@/components/ui/ProbabilityBar";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  market: Market;
  match: Match;
  /** When provided, uses this football image as card background with gradient overlay */
  bgImage?: string;
}

export default function MarketCard({ market, match, bgImage }: MarketCardProps) {
  const topMover = [...market.outcomes].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))[0];
  const hasImg = !!bgImage;

  return (
    <Link href={`/match/${match.id}`} className="block h-full">
      <div
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-200 rounded-xl h-full",
          hasImg
            ? "hover:scale-[1.02] hover:shadow-xl"
            : "panel panel-hover p-4"
        )}
      >
        {/* Background image + gradient */}
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
            {/* Lighter at top (image visible), thicker at bottom (text readable) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.75) 100%)",
              }}
            />
          </>
        )}

        {/* Content */}
        <div className={cn("relative z-10 flex flex-col h-full", hasImg && "p-4")}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p
                className={cn("text-sm font-medium leading-snug mb-1", hasImg ? "text-white" : "text-bb-text")}
                style={hasImg ? { textShadow: "0 1px 4px rgba(0,0,0,0.5)" } : undefined}
              >
                {market.question}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full overflow-hidden flex items-center justify-center",
                    hasImg
                      ? "bg-white/15 backdrop-blur-sm border border-white/25"
                      : "bg-bb-navy border border-bb-border"
                  )}
                >
                  {match.homeTeam.flag
                    ? <img src={match.homeTeam.flag} alt={match.homeTeam.shortName} className="w-full h-full object-cover" />
                    : <span className="text-xs">{match.homeTeam.code}</span>
                  }
                </div>
                <span className={cn("text-xs font-mono", hasImg ? "text-white/60" : "text-bb-text-3")}>vs</span>
                <div
                  className={cn(
                    "w-7 h-7 rounded-full overflow-hidden flex items-center justify-center",
                    hasImg
                      ? "bg-white/15 backdrop-blur-sm border border-white/25"
                      : "bg-bb-navy border border-bb-border"
                  )}
                >
                  {match.awayTeam.flag
                    ? <img src={match.awayTeam.flag} alt={match.awayTeam.shortName} className="w-full h-full object-cover" />
                    : <span className="text-xs">{match.awayTeam.code}</span>
                  }
                </div>
                <Badge variant={market.status === "live" ? "live" : market.status === "settled" ? "settled" : "open"}>
                  {market.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Probability bar */}
          <div className="mb-3 flex-1">
            <ProbabilityBar outcomes={market.outcomes} onDark={hasImg} />
          </div>

          {/* Stats footer */}
          <div
            className={cn(
              "flex items-center justify-between pt-3",
              hasImg ? "border-t border-white/20" : "border-t border-bb-border"
            )}
          >
            <div className={cn("flex items-center gap-1 text-xs font-mono", hasImg ? "text-white/65" : "text-bb-text-3")}>
              <TrendingUp size={11} />
              <span>{formatVolume(market.totalVolume)}</span>
            </div>
            {topMover && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-mono",
                  topMover.change24h >= 0 ? "text-bb-green" : "text-bb-red"
                )}
              >
                {topMover.change24h >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>
                  {topMover.shortLabel} {topMover.change24h > 0 ? "+" : ""}
                  {(topMover.change24h * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
