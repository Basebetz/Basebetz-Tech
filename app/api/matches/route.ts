import { NextRequest, NextResponse } from "next/server";
import { fetchWorldCupMatches } from "@/lib/football-api";
import { getDb } from "@/lib/db";
import { ensureMarketsForMatches } from "@/lib/db-seed";
import type { Match } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const group  = searchParams.get("group");

  try {
    let matches: Match[] = await fetchWorldCupMatches();

    const db = await getDb();
    await ensureMarketsForMatches(db, matches);

    if (status) matches = matches.filter(m => m.status === status);
    if (group)  matches = matches.filter(m => m.group  === group);

    return NextResponse.json({ matches, total: matches.length });
  } catch (err) {
    console.error("[api/matches]", err);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
