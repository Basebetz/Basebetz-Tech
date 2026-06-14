import { NextResponse } from "next/server";
import { fetchWorldCupMatches } from "@/lib/football-api";
import { batchGeneratePredictions } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try {
    const matches = await fetchWorldCupMatches();
    const upcoming = matches.filter(m => m.status === "scheduled" || m.status === "live");
    const result = await batchGeneratePredictions(upcoming);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[predictions/generate]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
