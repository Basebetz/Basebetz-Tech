"use client";

import { useRef } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { Match } from "@/lib/types";
import MatchCard from "./MatchCard";
import LiveAnalyticsOverlay from "./LiveAnalyticsOverlay";

const BG_PRIMARY = "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1400&auto=format&fit=crop&q=80";
const BG_FALLBACK = "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1400&auto=format&fit=crop&q=80";

const UPCOMING_CARD_BG = [
  "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&auto=format&fit=crop&q=80",
];

interface GamesSectionProps {
  liveMatches: Match[];
  /** All matches on the nearest upcoming date (shown when no live matches) */
  nearestDayMatches: Match[];
}

function UpcomingCarouselInline({ matches }: { matches: Match[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (matches.length === 1) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-[420px]">
          <MatchCard match={matches[0]} featured />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/35 transition-all"
        aria-label="Scroll left"
      >
        <ChevronLeft size={16} />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {matches.map((m, i) => (
          <div key={m.id} className="flex-none w-[300px]">
            <MatchCard match={m} bgImage={UPCOMING_CARD_BG[i % UPCOMING_CARD_BG.length]} />
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/35 transition-all"
        aria-label="Scroll right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function GamesSection({ liveMatches, nearestDayMatches }: GamesSectionProps) {
  const hasLive = liveMatches.length > 0;
  const hasUpcoming = nearestDayMatches.length > 0;

  if (!hasLive && !hasUpcoming) return null;

  const isUpcomingMode = !hasLive;

  return (
    <section className="relative mb-10 rounded-2xl overflow-hidden" id="live">
      <div
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${BG_PRIMARY}), url(${BG_FALLBACK})`,
          backgroundSize: "cover, cover",
          backgroundPosition: "center top, center top",
          backgroundColor: "#0D1524",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.08) 18%, rgba(255,255,255,0.0) 32%, rgba(255,255,255,0.65) 58%, rgba(255,255,255,0.96) 82%, #ffffff 100%)",
        }}
      />

      <div className="relative z-10 px-6 pt-10 pb-8">
        {/* Section header */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {isUpcomingMode ? (
            <>
              <Clock size={18} className="text-white drop-shadow" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }} />
              <h2
                className="font-heading font-bold text-2xl text-white uppercase tracking-wide"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.65)" }}
              >
                {nearestDayMatches.length > 1 ? `${nearestDayMatches.length} Matches Today` : "Most Recent Upcoming"}
              </h2>
            </>
          ) : (
            <>
              <span className="live-dot" />
              <h2
                className="font-heading font-bold text-2xl text-white uppercase tracking-wide"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.65)" }}
              >
                Live Now
              </h2>
              <span
                className="text-white/80 font-mono text-sm"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}
              >
                · {liveMatches.length} match{liveMatches.length > 1 ? "es" : ""} in play
              </span>
            </>
          )}
        </div>

        {/* Live analytics overlay — first live match only */}
        {!isUpcomingMode && (
          <div className="max-w-[520px] mx-auto">
            <LiveAnalyticsOverlay match={liveMatches[0]} />
          </div>
        )}

        {/* Cards */}
        {isUpcomingMode ? (
          <UpcomingCarouselInline matches={nearestDayMatches} />
        ) : liveMatches.length === 1 ? (
          <div className="flex justify-center">
            <div className="w-full max-w-[420px]">
              <MatchCard match={liveMatches[0]} featured />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map(m => (
              <MatchCard key={m.id} match={m} featured />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
