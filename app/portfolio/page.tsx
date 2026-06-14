import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WalletBalances from "@/components/portfolio/WalletBalances";
import PortfolioStatsCard from "@/components/portfolio/PortfolioStats";
import PositionsTable from "@/components/portfolio/PositionsTable";
import { Briefcase } from "lucide-react";
import type { PortfolioStats } from "@/lib/types";

const EMPTY_STATS: PortfolioStats = {
  totalValue: 0,
  totalCost: 0,
  unrealizedPnl: 0,
  realizedPnl: 0,
  totalPnl: 0,
  roi: 0,
  winRate: 0,
  openPositions: 0,
  settledPositions: 0,
  claimableAmount: 0,
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bb-blue/10 border border-bb-blue/20 flex items-center justify-center">
            <Briefcase size={18} className="text-bb-blue" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-bb-text">Portfolio</h1>
            <p className="text-bb-text-3 text-sm font-mono">Your positions, P&amp;L, and settlement claims</p>
          </div>
        </div>

        {/* Live wallet balances + bet history */}
        <div className="mb-8">
          <WalletBalances />
        </div>

        {/* Stats summary */}
        <div className="mb-8">
          <PortfolioStatsCard stats={EMPTY_STATS} />
        </div>

        {/* Positions table */}
        <div>
          <h2 className="font-heading font-bold text-lg text-bb-text uppercase tracking-wide mb-4">Positions</h2>
          <PositionsTable positions={[]} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
