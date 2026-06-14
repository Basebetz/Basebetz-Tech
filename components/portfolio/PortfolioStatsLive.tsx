"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import PortfolioStatsCard from "./PortfolioStats";
import type { PortfolioStats } from "@/lib/types";

interface BetRecord {
  marketId: string;
  outcome: string;
  amount: string;
}

interface MarketInfo {
  status: string;
  outcomes?: { label: string }[];
  winningOutcome?: number;
  settlementResult?: string;
}

const EMPTY: PortfolioStats = {
  totalValue: 0, totalCost: 0,
  unrealizedPnl: 0, realizedPnl: 0, totalPnl: 0,
  roi: 0, winRate: 0,
  openPositions: 0, settledPositions: 0, claimableAmount: 0,
};

export default function PortfolioStatsLive() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<PortfolioStats>(EMPTY);

  useEffect(() => {
    if (!isConnected) { setStats(EMPTY); return; }

    let bets: BetRecord[] = [];
    try {
      bets = JSON.parse(localStorage.getItem("basebetz_bets") ?? "[]");
    } catch { return; }

    if (bets.length === 0) return;

    const uniqueIds = [...new Set(bets.map(b => b.marketId))];

    Promise.all(
      uniqueIds.map(id =>
        fetch(`/api/market/${id}`)
          .then(r => r.json())
          .then(d => ({ id, ...(d.market as MarketInfo) }))
          .catch(() => ({ id, status: "open" as const }))
      )
    ).then(results => {
      const marketMap: Record<string, MarketInfo & { id: string }> = {};
      results.forEach(r => { marketMap[r.id] = r; });

      let openPositions    = 0;
      let settledPositions = 0;
      let totalCost        = 0;
      let wins             = 0;
      let losses           = 0;

      for (const bet of bets) {
        const amount  = parseFloat(bet.amount ?? "0") || 0;
        totalCost    += amount;

        const mkt = marketMap[bet.marketId];
        const isSettled = mkt?.status === "settled";

        if (isSettled) {
          settledPositions++;
          // Determine win/loss by matching outcome label
          const winIdx    = mkt?.winningOutcome;
          const outcomes  = mkt?.outcomes ?? [];
          const winLabel  = winIdx !== undefined && winIdx !== null
            ? (outcomes[winIdx]?.label ?? mkt?.settlementResult ?? "")
            : (mkt?.settlementResult ?? "");
          const won = winLabel && bet.outcome.toLowerCase() === winLabel.toLowerCase();
          if (won) wins++; else losses++;
        } else {
          openPositions++;
        }
      }

      const settled = wins + losses;
      const winRate = settled > 0 ? wins / settled : 0;

      // totalValue: open stakes are still in play; realized PnL assumes ~2x on wins (rough)
      const openValue   = bets
        .filter(b => marketMap[b.marketId]?.status !== "settled")
        .reduce((s, b) => s + (parseFloat(b.amount ?? "0") || 0), 0);
      const realizedPnl = wins > 0 || losses > 0
        ? bets
            .filter(b => {
              const mkt = marketMap[b.marketId];
              if (mkt?.status !== "settled") return false;
              const winIdx   = mkt?.winningOutcome;
              const outcomes = mkt?.outcomes ?? [];
              const winLabel = winIdx !== undefined && winIdx !== null
                ? (outcomes[winIdx]?.label ?? mkt?.settlementResult ?? "")
                : (mkt?.settlementResult ?? "");
              return winLabel && b.outcome.toLowerCase() === winLabel.toLowerCase();
            })
            .reduce((s, b) => s + (parseFloat(b.amount ?? "0") || 0), 0)
          - bets
            .filter(b => {
              const mkt = marketMap[b.marketId];
              if (mkt?.status !== "settled") return false;
              const winIdx   = mkt?.winningOutcome;
              const outcomes = mkt?.outcomes ?? [];
              const winLabel = winIdx !== undefined && winIdx !== null
                ? (outcomes[winIdx]?.label ?? mkt?.settlementResult ?? "")
                : (mkt?.settlementResult ?? "");
              return !winLabel || b.outcome.toLowerCase() !== winLabel.toLowerCase();
            })
            .reduce((s, b) => s + (parseFloat(b.amount ?? "0") || 0), 0)
        : 0;

      const totalValue   = openValue;
      const totalPnl     = realizedPnl;
      const roi          = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

      setStats({
        totalValue,
        totalCost,
        unrealizedPnl: 0,
        realizedPnl,
        totalPnl,
        roi,
        winRate,
        openPositions,
        settledPositions,
        claimableAmount: 0,
      });
    });
  }, [isConnected, address]);

  return <PortfolioStatsCard stats={stats} />;
}
