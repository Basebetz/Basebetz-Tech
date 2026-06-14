import { NextResponse } from "next/server";
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

export async function GET() {
  return NextResponse.json({ stats: EMPTY_STATS, positions: [] });
}
