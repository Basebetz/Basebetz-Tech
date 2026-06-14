import type { Db } from "mongodb";
import type { Match } from "./types";
import { generateMarketsForMatch } from "./market-generator";

export async function ensureMarketsForMatches(db: Db, matches: Match[]): Promise<void> {
  if (matches.length === 0) return;

  const existingMatchIds = (await db.collection("markets").distinct("matchId")) as string[];
  const existingSet = new Set(existingMatchIds);

  const newMarkets = matches
    .filter(m => !existingSet.has(m.id))
    .flatMap(generateMarketsForMatch);

  if (newMarkets.length > 0) {
    await db.collection("markets").insertMany(newMarkets as object[]);
  }
}
