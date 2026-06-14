import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { fetchWorldCupMatches } from "@/lib/football-api";
import { ensureMarketsForMatches } from "@/lib/db-seed";
import type { Market } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status  = searchParams.get("status");
  const matchId = searchParams.get("matchId");
  const type    = searchParams.get("type");

  try {
    const [db, matches] = await Promise.all([getDb(), fetchWorldCupMatches()]);
    await ensureMarketsForMatches(db, matches);

    const filter: Record<string, string> = {};
    if (status)  filter.status  = status;
    if (matchId) filter.matchId = matchId;
    if (type)    filter.type    = type;

    const markets = await db.collection<Market>("markets").find(filter).toArray();

    const matchMap = new Map(matches.map(m => [m.id, m]));
    const enriched = markets.map(({ _id, ...market }) => ({
      ...market,
      match: matchMap.get(market.matchId),
    }));

    return NextResponse.json({ markets: enriched, total: enriched.length });
  } catch (err) {
    console.error("[api/markets]", err);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}
