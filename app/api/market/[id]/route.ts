import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fetchWorldCupMatches } from "@/lib/football-api";
import { ensureMarketsForMatches } from "@/lib/db-seed";
import type { Market, TradeEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [db, matches] = await Promise.all([getDb(), fetchWorldCupMatches()]);
    await ensureMarketsForMatches(db, matches);

    const doc = await db.collection<Market>("markets").findOne({ id: params.id });
    if (!doc) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    const { _id, ...market } = doc as Market & { _id: unknown };
    const match  = matches.find(m => m.id === market.matchId);
    const trades = await db
      .collection<TradeEvent>("trades")
      .find({})
      .limit(10)
      .toArray();

    return NextResponse.json({ market, match, trades });
  } catch (err) {
    console.error("[api/market/id]", err);
    return NextResponse.json({ error: "Failed to fetch market" }, { status: 500 });
  }
}
