import Link from "next/link";
import { ArrowLeft, Clock, Trophy, TrendingUp, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedCard from "@/components/home/AnimatedCard";
import { fetchWorldCupMatches } from "@/lib/football-api";
import { getDb } from "@/lib/db";
import { ensureMarketsForMatches } from "@/lib/db-seed";
import { formatKickoff, formatVolume } from "@/lib/utils";
import type { Match, Market } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import CountdownTimer from "@/components/ui/CountdownTimer";
import ProbabilityBar from "@/components/ui/ProbabilityBar";

export const revalidate = 30;

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&auto=format&fit=crop&q=80",
];

function FlagImg({ src, alt }: { src: string; alt: string }) {
  if (!src) return <span className="font-mono text-sm font-bold text-bb-text-3">{alt.slice(0, 3)}</span>;
  return <img src={src} alt={alt} className="w-10 h-7 object-cover rounded-sm" />;
}

interface GroupMatchCardProps {
  match: Match;
  market?: Market;
  bgIdx: number;
}

function GroupMatchCard({ match, market, bgIdx }: GroupMatchCardProps) {
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const isScheduled = match.status === "scheduled";
  const bg = BG_IMAGES[bgIdx % BG_IMAGES.length];

  return (
    <Link href={`/match/${match.id}`} className="block h-full">
      <div className="relative overflow-hidden rounded-xl cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-200 h-full">
        {/* Background */}
        <div className="absolute inset-0" style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#0D1524" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.88) 100%)" }} />

        <div className="relative z-10 p-4 flex flex-col h-full" style={{ minHeight: 220 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? "live" : isFinished ? "settled" : "open"}>
                {isLive ? `LIVE ${match.minute}'` : isFinished ? "FT" : "Upcoming"}
              </Badge>
              <Badge variant="gray">Group {match.group}</Badge>
            </div>
            <span className="text-white/60 text-xs font-mono flex items-center gap-1">
              <MapPin size={10} /> {match.city !== "TBD" ? match.city : match.venue}
            </span>
          </div>

          {/* Teams row */}
          <div className="flex items-center justify-between gap-3 flex-1">
            {/* Home */}
            <div className="flex flex-col items-start gap-1">
              <FlagImg src={match.homeTeam.flag} alt={match.homeTeam.code} />
              <span className="font-heading font-bold text-base text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                {match.homeTeam.shortName}
              </span>
            </div>

            {/* Score / Kickoff */}
            <div className="flex flex-col items-center gap-1">
              {isFinished || isLive ? (
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-3xl text-white">{match.homeScore}</span>
                  <span className="font-mono text-white/40">–</span>
                  <span className="font-display font-bold text-3xl text-white">{match.awayScore}</span>
                </div>
              ) : (
                <span className="font-heading font-bold text-xl text-white/50">VS</span>
              )}
              {isScheduled && (
                <span className="text-xs font-mono text-white/70 flex items-center gap-1">
                  <Clock size={10} /><CountdownTimer target={match.kickoff} />
                </span>
              )}
              {isScheduled && (
                <span className="text-[10px] font-mono text-white/50">
                  {formatKickoff(match.kickoff).split("·")[1]?.trim()}
                </span>
              )}
            </div>

            {/* Away */}
            <div className="flex flex-col items-end gap-1">
              <FlagImg src={match.awayTeam.flag} alt={match.awayTeam.code} />
              <span className="font-heading font-bold text-base text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                {match.awayTeam.shortName}
              </span>
            </div>
          </div>

          {/* Market odds strip */}
          {market && (
            <div className="mt-4 pt-3 border-t border-white/20">
              <ProbabilityBar outcomes={market.outcomes} onDark />
            </div>
          )}

          {/* Footer */}
          {!market && (
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-white/50 text-xs font-mono flex items-center gap-1">
                <TrendingUp size={10} /> {formatVolume(match.totalVolume)} vol
              </span>
              <span className="text-white/50 text-xs font-mono">{match.marketCount} markets</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function GroupPage({ params }: { params: { group: string } }) {
  const groupLetter = params.group.toUpperCase();

  const matches = await fetchWorldCupMatches();
  const groupMatches = matches
    .filter(m => m.group === groupLetter)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  const db = await getDb();
  await ensureMarketsForMatches(db, groupMatches);

  const allMarkets = await db
    .collection<Market>("markets")
    .find({ status: { $in: ["open", "live", "settled"] } })
    .toArray();

  const marketByMatch = new Map<string, Market>();
  for (const { _id, ...m } of allMarkets) {
    const market = m as Market;
    if (!marketByMatch.has(market.matchId)) marketByMatch.set(market.matchId, market);
  }

  const live = groupMatches.filter(m => m.status === "live");
  const upcoming = groupMatches.filter(m => m.status === "scheduled");
  const finished = groupMatches.filter(m => m.status === "finished");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="absolute inset-0" style={{ backgroundImage: "url(/show.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)" }} />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-bb-gold to-transparent" />
          <div className="relative z-10 px-8 py-10">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/tournament" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-mono transition-colors">
                <ArrowLeft size={12} /> Tournament
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-white/60 text-xs font-mono">Group {groupLetter}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={20} className="text-bb-gold" />
              <span className="text-bb-gold font-mono text-xs uppercase tracking-[0.3em] font-semibold">FIFA World Cup 2026</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white leading-none" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
              GROUP <span className="text-bb-gold">{groupLetter}</span>
            </h1>
            <p className="text-white/55 text-sm font-mono mt-2">{groupMatches.length} matches · {live.length} live · {upcoming.length} upcoming · {finished.length} played</p>
          </div>
        </div>

        {groupMatches.length === 0 ? (
          <div className="text-center py-24">
            <Trophy size={40} className="text-bb-text-3 mx-auto mb-4" />
            <p className="text-bb-text-2 font-mono">No matches found for Group {groupLetter}.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Live */}
            {live.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-heading font-bold text-lg text-bb-green uppercase tracking-wide mb-4">
                  <span className="live-dot" /> Live Now
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {live.map((m, i) => (
                    <AnimatedCard key={m.id} delay={i * 0.07}>
                      <GroupMatchCard match={m} market={marketByMatch.get(m.id)} bgIdx={i} />
                    </AnimatedCard>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-heading font-bold text-lg text-bb-blue uppercase tracking-wide mb-4">
                  <Clock size={16} /> Upcoming Fixtures
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map((m, i) => (
                    <AnimatedCard key={m.id} delay={i * 0.07}>
                      <GroupMatchCard match={m} market={marketByMatch.get(m.id)} bgIdx={i + 1} />
                    </AnimatedCard>
                  ))}
                </div>
              </section>
            )}

            {/* Finished */}
            {finished.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 font-heading font-bold text-lg text-bb-text-2 uppercase tracking-wide mb-4">
                  <Trophy size={16} /> Played
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {finished.map((m, i) => (
                    <AnimatedCard key={m.id} delay={i * 0.07}>
                      <GroupMatchCard match={m} market={marketByMatch.get(m.id)} bgIdx={i + 2} />
                    </AnimatedCard>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
