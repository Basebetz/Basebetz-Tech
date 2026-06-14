import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { getDb } from "@/lib/db";
import { Trophy, TrendingUp, Users, Zap } from "lucide-react";
import type { LeaderboardUser } from "@/lib/types";

export const revalidate = 60;

export default async function LeaderboardPage() {
  const db = await getDb();
  const docs = await db
    .collection<LeaderboardUser>("leaderboard")
    .find({})
    .sort({ roi: -1 })
    .limit(100)
    .toArray();
  const users: LeaderboardUser[] = docs.map(({ _id, ...u }) => u as LeaderboardUser);
  const top3 = users.slice(0, 3);
  const total = await db.collection("leaderboard").countDocuments();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">

        <div className="mb-8 text-center">
          <p className="text-bb-gold font-mono text-xs uppercase tracking-[0.3em] mb-2">FIFA 2026 · Season Rankings</p>
          <h1 className="font-display font-bold text-5xl text-bb-text mb-2">
            <span className="text-bb-gold">LEADER</span>BOARD
          </h1>
          <p className="text-bb-text-2 text-sm font-mono">Top forecasters ranked by ROI, P&L, and win rate.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Total Traders",    value: total > 0 ? total.toLocaleString() : "—",    icon: Users,      color: "text-bb-blue" },
            { label: "Total Volume",     value: "$0",     icon: TrendingUp, color: "text-bb-gold" },
            { label: "Avg ROI (Top 50)", value: "—",      icon: TrendingUp, color: "text-bb-green" },
            { label: "Longest Streak",   value: "—",      icon: Zap,        color: "text-bb-teal" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="panel p-4 flex items-center gap-3">
              <Icon size={18} className={`${color} opacity-80`} />
              <div>
                <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
                <p className="text-bb-text-3 text-xs font-mono">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {top3.length > 0 ? (
          <>
            <div className="mb-10">
              <h2 className="font-heading font-bold text-lg text-bb-gold uppercase tracking-wide mb-4 text-center">Top Forecasters</h2>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="panel p-5 text-center border-bb-text-3/20 flex flex-col items-center justify-end pt-8">
                  <span className="text-3xl mb-2">{top3[1]?.avatar}</span>
                  <p className="text-2xl mb-1">🥈</p>
                  <p className="text-bb-text font-heading font-bold text-sm">{top3[1]?.displayName}</p>
                  <p className="text-bb-green font-mono font-bold text-lg mt-1">+{top3[1]?.roi.toFixed(1)}%</p>
                  <p className="text-bb-text-3 text-xs font-mono">${((top3[1]?.totalPnl ?? 0) / 1000).toFixed(1)}K P&L</p>
                </div>
                <div className="panel p-5 text-center border-bb-gold/35 bg-bb-gold/5 shadow-[0_0_24px_rgba(184,146,13,0.12)] flex flex-col items-center -mt-4">
                  <span className="text-4xl mb-2">{top3[0]?.avatar}</span>
                  <p className="text-3xl mb-1">🥇</p>
                  <p className="text-bb-text font-heading font-bold text-base">{top3[0]?.displayName}</p>
                  <p className="text-bb-green font-mono font-bold text-2xl mt-1">+{top3[0]?.roi.toFixed(1)}%</p>
                  <p className="text-bb-text-3 text-xs font-mono">${((top3[0]?.totalPnl ?? 0) / 1000).toFixed(1)}K P&L</p>
                  <span className="mt-2 px-2 py-0.5 text-[10px] font-mono uppercase border border-bb-gold/35 text-bb-gold bg-bb-gold/8 rounded">💎 Diamond</span>
                </div>
                <div className="panel p-5 text-center border-[#A05C1A]/20 flex flex-col items-center justify-end pt-8">
                  <span className="text-3xl mb-2">{top3[2]?.avatar}</span>
                  <p className="text-2xl mb-1">🥉</p>
                  <p className="text-bb-text font-heading font-bold text-sm">{top3[2]?.displayName}</p>
                  <p className="text-bb-green font-mono font-bold text-lg mt-1">+{top3[2]?.roi.toFixed(1)}%</p>
                  <p className="text-bb-text-3 text-xs font-mono">${((top3[2]?.totalPnl ?? 0) / 1000).toFixed(1)}K P&L</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-bb-text uppercase tracking-wide mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-bb-gold" />
                Full Rankings
              </h2>
              <LeaderboardTable users={users} />
            </div>
          </>
        ) : (
          <div className="panel border-bb-blue/15 p-16 text-center bg-bb-navy/40 rounded-xl">
            <Trophy size={40} className="text-bb-gold/40 mx-auto mb-4" />
            <p className="text-bb-text font-heading font-bold text-xl mb-2">No traders yet</p>
            <p className="text-bb-text-3 text-sm font-mono">Connect your wallet and make your first prediction to claim the top spot.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
