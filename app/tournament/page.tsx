import Link from "next/link";
import { Trophy, ArrowLeft, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { fetchWorldCupStandings } from "@/lib/football-api";
import type { GroupStanding } from "@/lib/types";
import FlagImage from "@/components/ui/FlagImage";

export const revalidate = 60;


function GroupTable({ group }: { group: GroupStanding }) {
  return (
    <div className="panel rounded-xl overflow-hidden">
      {/* Group header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bb-border bg-bb-panel">
        <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">
          Group {group.group}
        </h3>
        <Link
          href={`/tournament/group/${group.group}`}
          className="flex items-center gap-1 text-bb-blue text-xs font-mono font-semibold hover:text-bb-blue-2 transition-colors"
        >
          <TrendingUp size={11} /> BET NOW
        </Link>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2.5rem_2rem_2.5rem] gap-x-1 px-4 py-2 text-[10px] font-mono text-bb-text-3 uppercase tracking-wider border-b border-bb-border">
        <span>#</span>
        <span>Team</span>
        <span className="text-center">MP</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GF:GA</span>
        <span className="text-center">GD</span>
        <span className="text-center font-bold text-bb-text-2">Pts</span>
      </div>

      {/* Rows */}
      {group.table.map((row, idx) => {
        const isQualified = idx < 2;
        return (
          <div
            key={row.team.tla}
            className={`grid grid-cols-[2rem_1fr_2rem_2rem_2rem_2rem_2.5rem_2rem_2.5rem] gap-x-1 px-4 py-2.5 text-xs font-mono items-center border-b border-bb-border last:border-0 ${
              isQualified ? "bg-bb-blue/3" : ""
            }`}
          >
            <span className={`font-bold ${isQualified ? "text-bb-blue" : "text-bb-text-3"}`}>
              {row.position}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              {isQualified && (
                <span className="w-0.5 h-4 rounded-full bg-bb-blue flex-none" />
              )}
              <FlagImage src={row.team.flag} alt={row.team.tla} className="w-6 h-4 object-cover rounded-sm" fallbackText={row.team.tla} />
              <span className="text-bb-text font-semibold truncate">{row.team.shortName}</span>
            </div>
            <span className="text-center text-bb-text-2">{row.playedGames}</span>
            <span className="text-center text-bb-green font-semibold">{row.won}</span>
            <span className="text-center text-bb-gold">{row.draw}</span>
            <span className="text-center text-bb-red">{row.lost}</span>
            <span className="text-center text-bb-text-2">{row.goalsFor}:{row.goalsAgainst}</span>
            <span className={`text-center font-semibold ${row.goalDifference > 0 ? "text-bb-green" : row.goalDifference < 0 ? "text-bb-red" : "text-bb-text-3"}`}>
              {row.goalDifference > 0 ? "+" : ""}{row.goalDifference}
            </span>
            <span className="text-center font-bold text-bb-text">{row.points}</span>
          </div>
        );
      })}
    </div>
  );
}

export default async function TournamentPage() {
  const standings = await fetchWorldCupStandings();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        {/* Header banner */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div
            className="absolute inset-0 bg-no-repeat"
            style={{ backgroundImage: "url(/show.png)", backgroundSize: "cover", backgroundPosition: "center top" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)" }} />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-bb-gold to-transparent" />

          <div className="relative z-10 px-8 py-10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-mono mb-6 transition-colors">
              <ArrowLeft size={12} /> Back to Markets
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={20} className="text-bb-gold" />
              <span className="text-bb-gold font-mono text-xs uppercase tracking-[0.3em] font-semibold">FIFA World Cup 2026</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white leading-none" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
              TOURNAMENT
              <span className="block text-bb-gold">STANDINGS</span>
            </h1>
            <p className="text-white/55 text-sm font-mono mt-3">48 teams · 12 groups · USA, Canada &amp; Mexico · June–July 2026</p>
          </div>
        </div>

        {/* Groups grid */}
        {standings.length === 0 ? (
          <div className="text-center py-24">
            <Trophy size={40} className="text-bb-text-3 mx-auto mb-4" />
            <p className="text-bb-text-2 font-mono">Standings not available yet.</p>
            <p className="text-bb-text-3 text-sm font-mono mt-1">Check back once matches begin.</p>
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-6 text-xs font-mono text-bb-text-3">
              <div className="flex items-center gap-1.5">
                <span className="w-0.5 h-4 rounded-full bg-bb-blue" />
                <span>Qualifies to Round of 32</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {standings.map((group) => (
                <GroupTable key={group.group} group={group} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
