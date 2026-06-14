export type MarketStatus = "upcoming" | "open" | "live" | "closed" | "settled";
export type MarketType =
  | "match_winner"
  | "qualification"
  | "tournament_winner"
  | "both_teams_score"
  | "total_goals";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  flag: string;
  group: string;
  elo: number;
  form: ("W" | "D" | "L")[];
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  color: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  group: string;
  stage: string;
  kickoff: string;
  venue: string;
  city: string;
  country: string;
  status: "scheduled" | "live" | "halftime" | "finished";
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  totalVolume: number;
  marketCount: number;
}

export interface MarketOutcome {
  id: string;
  label: string;
  shortLabel: string;
  probability: number;
  price: number;
  volume: number;
  change24h: number;
}

export interface PricePoint {
  t: number;
  home: number;
  draw: number;
  away: number;
}

export interface Market {
  id: string;
  matchId: string;
  type: MarketType;
  question: string;
  outcomes: MarketOutcome[];
  status: MarketStatus;
  totalVolume: number;
  openInterest: number;
  createdAt: string;
  closesAt: string;
  settledAt?: string;
  settlementResult?: string;
  priceHistory: PricePoint[];
  contractAddress?: string;
}

export interface Position {
  id: string;
  marketId: string;
  matchId: string;
  marketQuestion: string;
  outcome: string;
  side: "YES" | "NO";
  shares: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  cost: number;
  status: "open" | "closed" | "settled";
  claimable: boolean;
  claimAmount?: number;
}

export interface TradeEvent {
  id: string;
  walletAddress: string;
  displayName: string;
  outcome: string;
  side: "YES" | "NO";
  shares: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface LeaderboardUser {
  rank: number;
  walletAddress: string;
  displayName: string;
  avatar: string;
  totalVolume: number;
  totalPnl: number;
  roi: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  badge: "diamond" | "gold" | "silver" | "bronze" | "none";
}

export interface NewsItem {
  id: string;
  teamId?: string;
  matchId?: string;
  headline: string;
  summary: string;
  type: "injury" | "lineup" | "form" | "weather" | "expert" | "market";
  impact: "positive" | "negative" | "neutral";
  source: string;
  timestamp: string;
  priceImpact?: number;
}

export interface TeamStandingRow {
  position: number;
  team: { name: string; shortName: string; tla: string; flag: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStanding {
  group: string;
  table: TeamStandingRow[];
}

export interface StoredPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  prediction: "home" | "draw" | "away";
  confidence: number;
  scoreline: string;
  summary: string;
  keyFactors: string[];
  homeWinPct: number;
  drawPct: number;
  awayWinPct: number;
  generatedAt: string;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  unrealizedPnl: number;
  realizedPnl: number;
  totalPnl: number;
  roi: number;
  winRate: number;
  openPositions: number;
  settledPositions: number;
  claimableAmount: number;
}
