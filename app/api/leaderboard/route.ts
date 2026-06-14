import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { LeaderboardUser } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORTABLE = ["roi", "totalPnl", "totalVolume", "winRate"] as const;
type SortKey = typeof SORTABLE[number];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sortBy = (searchParams.get("sortBy") ?? "roi") as SortKey;
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "100", 10), 200);
  const key    = SORTABLE.includes(sortBy) ? sortBy : "roi";

  try {
    const db = await getDb();

    const users = await db
      .collection<LeaderboardUser>("leaderboard")
      .find({})
      .sort({ [key]: -1 })
      .limit(limit)
      .toArray();

    const total = await db.collection("leaderboard").countDocuments();

    return NextResponse.json({
      users: users.map(({ _id, ...u }) => u),
      total,
    });
  } catch (err) {
    console.error("[api/leaderboard]", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
