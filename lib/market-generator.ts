import type { Match, Market, MarketOutcome, PricePoint } from "./types";

function eloProbs(homeElo: number, awayElo: number) {
  const diff = homeElo - awayElo;
  const expected = 1 / (1 + Math.pow(10, -diff / 400));
  const drawBase = Math.max(0.12, 0.28 - 0.12 * (Math.abs(diff) / 400));
  const h = expected * (1 - drawBase);
  const a = (1 - expected) * (1 - drawBase);
  const total = h + drawBase + a;
  return { home: h / total, draw: drawBase / total, away: a / total };
}

function seededRng(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return () => {
    h = (Math.imul(h, 1_664_525) + 1_013_904_223) | 0;
    return (h >>> 0) / 0x1_0000_0000;
  };
}

function makePriceHistory(home: number, draw: number, away: number, seed: string): PricePoint[] {
  const rng = seededRng(seed);
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => {
    const j = () => (rng() - 0.5) * 0.06;
    return {
      t: now - (23 - i) * 3_600_000,
      home: Math.max(0.01, Math.min(0.97, home + j())),
      draw: Math.max(0.01, Math.min(0.97, draw + j())),
      away: Math.max(0.01, Math.min(0.97, away + j())),
    };
  });
}

function mkOutcome(id: string, label: string, shortLabel: string, prob: number, rng: () => number): MarketOutcome {
  return {
    id,
    label,
    shortLabel,
    probability: prob,
    price: prob,
    volume: Math.floor(rng() * 60_000 + 5_000),
    change24h: parseFloat(((rng() - 0.5) * 0.08).toFixed(4)),
  };
}

export function generateMarketsForMatch(match: Match): Market[] {
  const rng = seededRng(match.id);
  const { home, draw, away } = eloProbs(match.homeTeam.elo, match.awayTeam.elo);
  const now = new Date().toISOString();

  const statusMap: Record<Match["status"], Market["status"]> = {
    scheduled: "open",
    live: "live",
    halftime: "live",
    finished: "settled",
  };
  const ms = statusMap[match.status];

  const baseSettled =
    match.status === "finished"
      ? {
          settledAt: now,
          settlementResult:
            match.homeScore! > match.awayScore!
              ? `${match.homeTeam.name} Win`
              : match.homeScore === match.awayScore
              ? "Draw"
              : `${match.awayTeam.name} Win`,
        }
      : {};

  const mwVol = Math.floor(rng() * 200_000 + 20_000);
  const matchWinner: Market = {
    id: `mw-${match.id}`,
    matchId: match.id,
    type: "match_winner",
    question: `Who wins: ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}?`,
    outcomes: [
      mkOutcome(`${match.id}-home`, `${match.homeTeam.name} Win`, match.homeTeam.shortName, home, rng),
      mkOutcome(`${match.id}-draw`, "Draw", "Draw", draw, rng),
      mkOutcome(`${match.id}-away`, `${match.awayTeam.name} Win`, match.awayTeam.shortName, away, rng),
    ],
    status: ms,
    totalVolume: mwVol,
    openInterest: Math.floor(mwVol * 0.4),
    createdAt: now,
    closesAt: match.kickoff,
    priceHistory: makePriceHistory(home, draw, away, `${match.id}-mw`),
    ...baseSettled,
  };

  const hwins = match.homeTeam.form.filter(f => f === "W").length;
  const awins = match.awayTeam.form.filter(f => f === "W").length;
  const btsProb = Math.min(0.82, Math.max(0.28, (0.4 + hwins * 0.03) * (0.4 + awins * 0.03) * 3));
  const btsSettled =
    match.status === "finished"
      ? {
          settledAt: now,
          settlementResult: match.homeScore! > 0 && match.awayScore! > 0 ? "Yes" : "No",
        }
      : {};
  const btsVol = Math.floor(rng() * 80_000 + 8_000);
  const bts: Market = {
    id: `bts-${match.id}`,
    matchId: match.id,
    type: "both_teams_score",
    question: `Both teams to score: ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}?`,
    outcomes: [
      mkOutcome(`${match.id}-bts-yes`, "Yes", "YES", btsProb, rng),
      mkOutcome(`${match.id}-bts-no`, "No", "NO", 1 - btsProb, rng),
    ],
    status: ms,
    totalVolume: btsVol,
    openInterest: Math.floor(btsVol * 0.35),
    createdAt: now,
    closesAt: match.kickoff,
    priceHistory: makePriceHistory(btsProb, 0, 1 - btsProb, `${match.id}-bts`),
    ...btsSettled,
  };

  return [matchWinner, bts];
}
