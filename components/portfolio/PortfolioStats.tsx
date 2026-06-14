import { TrendingUp, DollarSign, Award, AlertCircle } from "lucide-react";
import type { PortfolioStats } from "@/lib/types";
import { formatUSDC, cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface PortfolioStatsProps {
  stats: PortfolioStats;
}

export default function PortfolioStatsCard({ stats }: PortfolioStatsProps) {
  return (
    <div className="space-y-6">
      {/* Claim banner */}
      {stats.claimableAmount > 0 && (
        <div className="panel border-bb-green/25 bg-bb-green/5 p-4 flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-bb-green" />
            <div>
              <p className="text-bb-green font-heading font-semibold text-sm uppercase tracking-wide mb-1">Claimable Winnings</p>
              <p className="text-bb-text-2 text-xs font-mono">{formatUSDC(stats.claimableAmount)} USDC ready to claim</p>
            </div>
          </div>
          <Button variant="green" size="sm">Claim All</Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Portfolio Value",  value: `$${formatUSDC(stats.totalValue)}`,  icon: DollarSign, color: "text-bb-text" },
          { label: "Unrealized P&L",   value: `+$${formatUSDC(stats.unrealizedPnl)}`, icon: TrendingUp, color: "text-bb-green" },
          { label: "Total P&L",        value: `+$${formatUSDC(stats.totalPnl)}`,   icon: TrendingUp, color: "text-bb-green" },
          { label: "Win Rate",         value: `${(stats.winRate * 100).toFixed(0)}%`, icon: Award, color: "text-bb-gold" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-bb-text-3" />
              <p className="text-bb-text-3 text-xs font-mono uppercase tracking-wider">{label}</p>
            </div>
            <p className={cn("font-display font-bold text-2xl", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* ROI bar */}
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-bb-text-2 text-sm font-heading font-semibold uppercase tracking-wide">Overall ROI</p>
          <span className="font-display font-bold text-2xl text-bb-green">+{stats.roi.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-bb-navy rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-bb-blue to-bb-green transition-all duration-1000"
            style={{ width: `${Math.min(stats.roi, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-bb-text-3 mt-1">
          <span>{stats.openPositions} Open</span>
          <span>{stats.settledPositions} Settled</span>
        </div>
      </div>
    </div>
  );
}
