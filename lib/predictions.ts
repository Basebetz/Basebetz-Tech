import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDb } from "./db";
import type { Match, StoredPrediction } from "./types";

export async function getPrediction(matchId: string): Promise<StoredPrediction | null> {
  const db = await getDb();
  const doc = await db.collection("predictions").findOne({ matchId });
  if (!doc) return null;
  const { _id, ...pred } = doc;
  return pred as StoredPrediction;
}

export async function getAllPredictions(): Promise<StoredPrediction[]> {
  const db = await getDb();
  const docs = await db.collection("predictions").find({}).toArray();
  return docs.map(({ _id, ...d }) => d as StoredPrediction);
}

function buildSinglePrompt(match: Match): string {
  return `You are a football analytics AI. Analyze this FIFA World Cup 2026 match and return a single JSON object.

Match: ${match.homeTeam.name} (${match.homeTeam.code}) vs ${match.awayTeam.name} (${match.awayTeam.code})
Group: ${match.group}
Home ELO: ${match.homeTeam.elo}, Form (last 5): ${match.homeTeam.form.join("")}
Away ELO: ${match.awayTeam.elo}, Form (last 5): ${match.awayTeam.form.join("")}

Return ONLY this JSON, no markdown:
{
  "prediction": "home" | "draw" | "away",
  "confidence": <integer 50-90>,
  "scoreline": "<e.g. 2-1>",
  "summary": "<2-3 sentence tactical analysis mentioning team names>",
  "keyFactors": ["<factor 1 max 12 words>", "<factor 2>", "<factor 3>"],
  "homeWinPct": <integer>,
  "drawPct": <integer>,
  "awayWinPct": <integer>
}
Rules: homeWinPct + drawPct + awayWinPct = 100. Use ELO and form to inform probabilities.`;
}

export async function generateAndStorePrediction(match: Match): Promise<StoredPrediction | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(buildSinglePrompt(match));
    const text = result.response.text().trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(text);

    const prediction: StoredPrediction = {
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      homeFlag: match.homeTeam.flag,
      awayFlag: match.awayTeam.flag,
      prediction: parsed.prediction,
      confidence: parsed.confidence,
      scoreline: parsed.scoreline,
      summary: parsed.summary,
      keyFactors: parsed.keyFactors,
      homeWinPct: parsed.homeWinPct,
      drawPct: parsed.drawPct,
      awayWinPct: parsed.awayWinPct,
      generatedAt: new Date().toISOString(),
    };

    const db = await getDb();
    await db.collection("predictions").updateOne(
      { matchId: match.id },
      { $set: prediction },
      { upsert: true }
    );
    return prediction;
  } catch (err) {
    console.error("[predictions] generate failed for", match.id, err);
    return null;
  }
}

export async function getOrGeneratePrediction(match: Match): Promise<StoredPrediction | null> {
  const existing = await getPrediction(match.id);
  if (existing) {
    const ageHours = (Date.now() - new Date(existing.generatedAt).getTime()) / 3_600_000;
    // Reuse if: match is finished, or prediction is < 6h old
    if (match.status === "finished" || ageHours < 6) return existing;
  }
  return generateAndStorePrediction(match);
}

export async function batchGeneratePredictions(matches: Match[]): Promise<{ generated: number; skipped: number }> {
  let generated = 0;
  let skipped = 0;
  for (const match of matches) {
    const existing = await getPrediction(match.id);
    if (existing) { skipped++; continue; }
    const result = await generateAndStorePrediction(match);
    if (result) generated++;
  }
  return { generated, skipped };
}
