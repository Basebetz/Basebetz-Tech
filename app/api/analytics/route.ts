import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchWorldCupMatches } from "@/lib/football-api";
import type { Match } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export interface MatchAnalysis {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  kickoff: string;
  group: string;
  prediction: "home" | "draw" | "away";
  confidence: number; // 0-100
  scoreline: string;  // e.g. "2-1"
  summary: string;    // 2-3 sentence analysis
  keyFactors: string[];
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
}

function buildPrompt(matches: Match[]): string {
  const fixtures = matches.slice(0, 10).map(m => ({
    id: m.id,
    home: m.homeTeam.name,
    homeCode: m.homeTeam.code,
    homeElo: m.homeTeam.elo,
    homeForm: m.homeTeam.form.join(""),
    away: m.awayTeam.name,
    awayCode: m.awayTeam.code,
    awayElo: m.awayTeam.elo,
    awayForm: m.awayTeam.form.join(""),
    kickoff: m.kickoff,
    group: m.group,
    stage: m.stage,
  }));

  return `You are a football analytics AI. Analyze the following upcoming FIFA World Cup 2026 fixtures and provide predictions.

For each match provide a JSON array with this exact structure:
[
  {
    "matchId": "<id>",
    "prediction": "home" | "draw" | "away",
    "confidence": <integer 50-90>,
    "scoreline": "<predicted score e.g. 2-1>",
    "summary": "<2-3 sentence tactical analysis>",
    "keyFactors": ["<factor 1>", "<factor 2>", "<factor 3>"],
    "homeWinPct": <integer>,
    "drawPct": <integer>,
    "awayWinPct": <integer>
  }
]

Rules:
- homeWinPct + drawPct + awayWinPct must equal 100
- confidence reflects your certainty in the predicted outcome (50 = coin flip, 90 = near certain)
- keyFactors: exactly 3 short bullet points (max 12 words each)
- summary: concise tactical reasoning, mention team names
- Use ELO ratings and recent form to inform your probabilities

Fixtures:
${JSON.stringify(fixtures, null, 2)}

Return ONLY the JSON array, no markdown, no explanation.`;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = parseInt(searchParams.get("limit") ?? "10", 10);
  const limit = Math.min(Math.max(1, limitParam), 10);

  try {
    const allMatches = await fetchWorldCupMatches();
    const upcoming = allMatches
      .filter(m => m.status === "scheduled")
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
      .slice(0, limit);

    if (upcoming.length === 0) {
      return NextResponse.json({ analyses: [], total: 0 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(buildPrompt(upcoming));
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed: MatchAnalysis[] = JSON.parse(cleaned);

    // Merge AI analysis with match metadata
    const analyses: MatchAnalysis[] = parsed.map(a => {
      const match = upcoming.find(m => m.id === a.matchId);
      return {
        ...a,
        homeTeam: match?.homeTeam.name ?? a.homeTeam ?? "",
        awayTeam: match?.awayTeam.name ?? a.awayTeam ?? "",
        homeFlag: match?.homeTeam.flag ?? "",
        awayFlag: match?.awayTeam.flag ?? "",
        kickoff: match?.kickoff ?? "",
        group: match?.group ?? "",
      };
    });

    return NextResponse.json(
      { analyses, total: analyses.length },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("[api/analytics]", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
