import { Flame, CheckCircle, Clock, Zap, Target, BarChart3 } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveTicker from "@/components/home/LiveTicker";
import MatchCard from "@/components/home/MatchCard";
import MarketCard from "@/components/home/MarketCard";
import GamesSection from "@/components/home/GamesSection";
import HeroSection from "@/components/home/HeroSection";
import TournamentBanner from "@/components/home/TournamentBanner";
import UpcomingCarousel from "@/components/home/UpcomingCarousel";
import ScrollReveal from "@/components/home/ScrollReveal";
import AnimatedCard from "@/components/home/AnimatedCard";
import AnimatedStatsBar from "@/components/home/AnimatedStatsBar";
import { fetchWorldCupMatches } from "@/lib/football-api";
import { getDb } from "@/lib/db";
import { ensureMarketsForMatches } from "@/lib/db-seed";
import type { Match, Market } from "@/lib/types";

export const revalidate = 30;

const SETTLED_BG_IMAGES = [
  "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522778526097-ce0a22ceb253?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
];

export default async function HomePage() {
  const matches: Match[] = await fetchWorldCupMatches();

  const db = await getDb();
  await ensureMarketsForMatches(db, matches);

  const allMarkets = await db
    .collection<Market>("markets")
    .find({ status: { $in: ["open", "live"] } })
    .limit(6)
    .toArray();

  const openMarkets = allMarkets.map(({ _id, ...m }) => m as Market);

  const liveMatches = matches.filter(m => m.status === "live");

  const scheduledByKickoff = matches
    .filter(m => m.status === "scheduled")
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime());

  // All matches on the nearest upcoming date (shown in the hero slot)
  const firstUpcomingDate = scheduledByKickoff[0]
    ? new Date(scheduledByKickoff[0].kickoff).toDateString()
    : null;
  const nearestDayMatches = liveMatches.length === 0 && firstUpcomingDate
    ? scheduledByKickoff.filter(m => new Date(m.kickoff).toDateString() === firstUpcomingDate)
    : [];

  const nearestDayIds = new Set(nearestDayMatches.map(m => m.id));
  const upcomingMatches = scheduledByKickoff
    .filter(m => !nearestDayIds.has(m.id))
    .slice(0, 20);

  const finishedMatches = matches.filter(m => m.status === "finished");

  const matchMap = new Map(matches.map(m => [m.id, m]));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <LiveTicker matches={matches} />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <HeroSection />

        {/* ── TOURNAMENT BANNER ────────────────────────────────────── */}
        <ScrollReveal blur>
          <TournamentBanner />
        </ScrollReveal>

        {/* ── LIVE NOW ─────────────────────────────────────────────── */}
        <GamesSection liveMatches={liveMatches} nearestDayMatches={nearestDayMatches} />

        {/* ── STATS ────────────────────────────────────────────────── */}
        <AnimatedStatsBar />

        {/* ── UPCOMING ─────────────────────────────────────────────── */}
        {upcomingMatches.length > 0 && (
          <section className="mb-12" id="upcoming">
            <ScrollReveal direction="left" className="flex items-center justify-between mb-5">
              <h2 className="section-heading font-heading font-bold text-xl text-bb-blue uppercase tracking-wide">
                <Clock size={17} />
                Upcoming Fixtures
              </h2>
              <span className="text-bb-text-3 text-xs font-mono border border-bb-border px-3 py-1 rounded">
                {upcomingMatches.length} matches
              </span>
            </ScrollReveal>
            <UpcomingCarousel matches={upcomingMatches} />
          </section>
        )}

        {/* ── TRENDING MARKETS ─────────────────────────────────────── */}
        {openMarkets.length > 0 && (
          <section className="mb-12" id="markets">
            <ScrollReveal direction="left" className="flex items-center justify-between mb-5">
              <h2 className="section-heading font-heading font-bold text-xl text-bb-gold uppercase tracking-wide">
                <Flame size={17} />
                Trending Markets
              </h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-bb-gold/25 bg-bb-gold/6 text-bb-gold font-mono text-[11px] font-semibold uppercase tracking-widest">
                <Zap size={11} /> Hot
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {openMarkets.map((market, i) => {
                const match = matchMap.get(market.matchId);
                return match ? (
                  <AnimatedCard key={market.id} delay={i * 0.07}>
                    <MarketCard market={market} match={match} />
                  </AnimatedCard>
                ) : null;
              })}
            </div>
          </section>
        )}

        {/* ── COMPLETED MATCHES ────────────────────────────────────── */}
        {finishedMatches.length > 0 && (
          <section className="mb-12">
            <ScrollReveal direction="left" className="flex items-center justify-between mb-5">
              <h2 className="section-heading font-heading font-bold text-xl text-bb-green uppercase tracking-wide">
                <CheckCircle size={17} />
                Completed Matches
              </h2>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-bb-green/25 bg-bb-green/6 text-bb-green font-mono text-[11px] font-semibold uppercase tracking-widest">
                <Target size={11} /> 100% accurate
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {finishedMatches.map((m, i) => (
                <AnimatedCard key={m.id} delay={i * 0.08}>
                  <MatchCard
                    match={m}
                    bgImage={SETTLED_BG_IMAGES[i % SETTLED_BG_IMAGES.length]}
                    nonClickable
                  />
                </AnimatedCard>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA BANNER ───────────────────────────────────────────── */}
        <ScrollReveal blur>
          <section
            className="relative overflow-hidden rounded-2xl border border-bb-blue/20 p-10 text-center"
            style={{ background: "linear-gradient(135deg, rgba(0,82,255,0.06) 0%, rgba(0,82,255,0.02) 40%, rgba(43,92,230,0.06) 100%)" }}
          >
            <div className="absolute inset-0 hero-field-bg opacity-40" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <BarChart3 size={14} className="text-bb-blue" />
                <p className="text-bb-blue font-mono text-xs uppercase tracking-[0.3em]">Base Network · USDC · Onchain</p>
              </div>
              <h2 className="font-display font-bold text-4xl text-bb-text mb-3">
                Where Match Conviction <span className="text-bb-blue">Trades</span>
              </h2>
              <p className="text-bb-text-2 max-w-lg mx-auto text-sm mb-8 leading-relaxed">
                Connect your wallet, deposit USDC on Base, and start trading FIFA match outcomes
                with transparent pricing and verifiable onchain settlement.
              </p>
            </div>
          </section>
        </ScrollReveal>

      </main>

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 pb-8">
        <Image
          src="/footer.jpg"
          alt="BASEBETZ — The Bull Case for Football"
          width={1280}
          height={480}
          className="w-full h-auto rounded-2xl"
        />
      </div>

      <Footer />
    </div>
  );
}
