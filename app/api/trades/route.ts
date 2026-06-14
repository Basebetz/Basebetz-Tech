import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, marketId, question, outcome, amount, txHash, timestamp } = body;

    if (!walletAddress || !marketId || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();
    const amountNum = parseFloat(amount ?? "0");

    // Record the trade
    await db.collection("trades").insertOne({
      walletAddress: walletAddress.toLowerCase(),
      marketId,
      question,
      outcome,
      amount: amountNum,
      txHash,
      timestamp: timestamp ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Upsert leaderboard entry — increment volume, recalculate badge
    const existing = await db.collection("leaderboard").findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    const totalVolume = (existing?.totalVolume ?? 0) + amountNum;
    const wins        = existing?.wins    ?? 0;
    const losses      = existing?.losses  ?? 0;
    const totalPnl    = existing?.totalPnl ?? 0;
    const winRate     = (wins + losses) > 0 ? wins / (wins + losses) : 0;
    const roi         = totalVolume > 0 ? (totalPnl / totalVolume) * 100 : 0;
    const badge       = totalVolume >= 10000 ? "diamond"
                      : totalVolume >= 1000  ? "gold"
                      : totalVolume >= 100   ? "silver"
                      : totalVolume >= 10    ? "bronze"
                      : "none";

    const shortAddr = walletAddress.slice(0, 6) + "…" + walletAddress.slice(-4);

    await db.collection("leaderboard").updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $set: {
          displayName: existing?.displayName ?? shortAddr,
          avatar:      existing?.avatar ?? "🎯",
          totalVolume,
          wins, losses,
          totalPnl,
          winRate,
          roi,
          streak:      existing?.streak ?? 0,
          badge,
          updatedAt:   new Date().toISOString(),
        },
        $setOnInsert: {
          walletAddress: walletAddress.toLowerCase(),
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/trades] POST error:", err);
    return NextResponse.json({ error: "Failed to record trade" }, { status: 500 });
  }
}
