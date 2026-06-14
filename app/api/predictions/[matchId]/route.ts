import { NextResponse } from "next/server";
import { fetchWorldCupMatches } from "@/lib/football-api";
import { getOrGeneratePrediction } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(_req: Request, { params }: { params: { matchId: string } }) {
  try {
    const matches = await fetchWorldCupMatches();
    const match = matches.find(m => m.id === params.matchId);
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const prediction = await getOrGeneratePrediction(match);
    if (!prediction) return NextResponse.json({ error: "Could not generate prediction" }, { status: 500 });

    return NextResponse.json(prediction);
  } catch (err) {
    console.error("[predictions/matchId]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
