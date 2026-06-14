/**
 * Run once locally to pre-populate all match predictions in MongoDB.
 *   npx tsx scripts/generate-predictions.ts
 */
import "dotenv/config";
import { fetchWorldCupMatches } from "../lib/football-api";
import { getPrediction, generateAndStorePrediction } from "../lib/predictions";

async function main() {
  console.log("Fetching WC 2026 matches…");
  const matches = await fetchWorldCupMatches();
  const targets = matches.filter(m => m.status === "scheduled" || m.status === "live" || m.status === "finished");
  console.log(`Found ${targets.length} matches to process.`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const match of targets) {
    const existing = await getPrediction(match.id);
    if (existing) {
      console.log(`  [skip] ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`);
      skipped++;
      continue;
    }
    process.stdout.write(`  [gen]  ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} … `);
    const result = await generateAndStorePrediction(match);
    if (result) {
      console.log(`✓ ${result.prediction} (${result.confidence}%)`);

      generated++;
    } else {
      console.log("✗ failed");
      failed++;
    }
    // Throttle to avoid rate limits
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\nDone. Generated: ${generated} | Skipped: ${skipped} | Failed: ${failed}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
