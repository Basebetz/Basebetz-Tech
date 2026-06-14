import type { Match, Team, GroupStanding } from "./types";

// Maps 3-letter TLA codes to flagcdn.com 2-letter codes
const FLAG_CODE: Record<string, string> = {
  ARG: "ar", BRA: "br", FRA: "fr", ENG: "gb-eng",
  ESP: "es", POR: "pt", GER: "de", NED: "nl",
  ITA: "it", USA: "us", MEX: "mx", CAN: "ca",
  URU: "uy", COL: "co", MAR: "ma", SEN: "sn",
  JPN: "jp", KOR: "kr", AUS: "au", SUI: "ch",
  BEL: "be", DEN: "dk", SRB: "rs", POL: "pl",
  ECU: "ec", CMR: "cm", CRI: "cr", SLV: "sv",
  TUR: "tr", PER: "pe", TUN: "tn", ALB: "al",
  NGA: "ng", CIV: "ci", EGY: "eg", IRN: "ir",
  SAU: "sa", QAT: "qa",
  // WC 2026 additional teams
  CZE: "cz", RSA: "za", BIH: "ba", SVK: "sk",
  SVN: "si", PAR: "py", VEN: "ve", CHI: "cl",
  BOL: "bo", GUA: "gt", HON: "hn", PAN: "pa",
  JAM: "jm", TRI: "tt", GRE: "gr", NOR: "no",
  SCO: "gb-sct", WAL: "gb-wls", NIR: "gb-nir",
  IRL: "ie", ROM: "ro", UKR: "ua", CRO: "hr",
  HUN: "hu", ISR: "il", GEO: "ge", MLI: "ml",
  GAB: "ga", GHA: "gh", ZIM: "zw", COD: "cd",
  AGO: "ao", TAN: "tz", ETH: "et", NZL: "nz",
  FIJ: "fj", KSA: "sa", ATH: "gr",
  // Additional WC 2026 qualifiers
  HAI: "ht", CUW: "cw", SWE: "se", CPV: "cv",
  URY: "uy",  // Uruguay alternate TLA from football-data
  IRQ: "iq", ALG: "dz", JOR: "jo", AUT: "at", UZB: "uz",
  LIB: "lb", PHI: "ph", THA: "th", IDN: "id",
  VIE: "vn", CHN: "cn", IND: "in",
};

function flagUrl(tla: string): string {
  const code = FLAG_CODE[tla];
  return code ? `https://flagcdn.com/w40/${code}.png` : "";
}

const TEAM_META: Record<string, { elo: number; color: string; form: ("W" | "D" | "L")[] }> = {
  ARG: { elo: 2072, color: "#74ACDF", form: ["W","W","W","W","D"] },
  BRA: { elo: 2058, color: "#009C3B", form: ["W","W","W","D","W"] },
  FRA: { elo: 2005, color: "#002395", form: ["W","W","D","W","W"] },
  ENG: { elo: 1964, color: "#012169", form: ["W","D","W","W","W"] },
  ESP: { elo: 1990, color: "#AA151B", form: ["W","W","W","D","W"] },
  POR: { elo: 1986, color: "#006600", form: ["W","W","D","W","W"] },
  GER: { elo: 1988, color: "#000000", form: ["W","W","L","W","W"] },
  NED: { elo: 1978, color: "#FF6600", form: ["W","W","L","W","D"] },
  ITA: { elo: 1906, color: "#009246", form: ["W","D","W","D","W"] },
  USA: { elo: 1722, color: "#002868", form: ["W","D","W","W","L"] },
  MEX: { elo: 1698, color: "#006847", form: ["L","W","D","W","W"] },
  CAN: { elo: 1665, color: "#FF0000", form: ["W","W","D","L","W"] },
  URU: { elo: 1842, color: "#5EB6E4", form: ["D","W","W","L","W"] },
  COL: { elo: 1748, color: "#FCD116", form: ["W","W","D","L","W"] },
  MAR: { elo: 1788, color: "#006233", form: ["W","W","L","W","D"] },
  SEN: { elo: 1778, color: "#00853F", form: ["W","W","D","L","W"] },
  JPN: { elo: 1802, color: "#BC002D", form: ["W","W","D","W","L"] },
  KOR: { elo: 1726, color: "#CD2E3A", form: ["D","W","L","W","D"] },
  AUS: { elo: 1688, color: "#00843D", form: ["W","L","D","W","L"] },
  SUI: { elo: 1818, color: "#FF0000", form: ["D","W","W","D","W"] },
  BEL: { elo: 1842, color: "#EF3340", form: ["W","D","W","W","L"] },
  DEN: { elo: 1855, color: "#C60C30", form: ["D","W","W","L","W"] },
  SRB: { elo: 1764, color: "#C6363C", form: ["W","L","D","W","L"] },
  POL: { elo: 1726, color: "#DC143C", form: ["W","D","L","W","W"] },
  ECU: { elo: 1680, color: "#FFD100", form: ["D","L","W","L","D"] },
  CMR: { elo: 1612, color: "#007A5E", form: ["D","L","W","L","D"] },
  CRI: { elo: 1628, color: "#002B7F", form: ["L","D","W","L","L"] },
  SLV: { elo: 1580, color: "#0F47AF", form: ["L","L","D","L","W"] },
  TUR: { elo: 1736, color: "#E30A17", form: ["W","W","D","L","W"] },
  PER: { elo: 1648, color: "#D91023", form: ["L","D","L","W","D"] },
  TUN: { elo: 1642, color: "#E70013", form: ["D","L","W","L","D"] },
  ALB: { elo: 1565, color: "#E41E20", form: ["L","D","L","W","L"] },
  NGA: { elo: 1672, color: "#008751", form: ["W","D","W","L","W"] },
  CIV: { elo: 1668, color: "#FF8200", form: ["W","W","D","W","L"] },
  EGY: { elo: 1658, color: "#CE1126", form: ["D","W","L","W","D"] },
  IRN: { elo: 1698, color: "#239F40", form: ["W","D","W","L","W"] },
  SAU: { elo: 1645, color: "#006C35", form: ["L","D","W","L","D"] },
  QAT: { elo: 1627, color: "#8D1B3D", form: ["L","D","L","W","L"] },
  CZE: { elo: 1724, color: "#D7141A", form: ["W","D","W","L","D"] },
  RSA: { elo: 1598, color: "#007A4D", form: ["D","L","W","L","D"] },
  BIH: { elo: 1658, color: "#002395", form: ["D","W","D","L","W"] },
  SVK: { elo: 1714, color: "#0B4EA2", form: ["W","D","L","W","W"] },
  SVN: { elo: 1698, color: "#003DA5", form: ["W","W","D","L","D"] },
  PAR: { elo: 1648, color: "#D52B1E", form: ["L","D","W","W","L"] },
  VEN: { elo: 1662, color: "#CF142B", form: ["W","W","L","D","W"] },
  CHI: { elo: 1642, color: "#D52B1E", form: ["D","L","W","D","L"] },
  BOL: { elo: 1568, color: "#007A3D", form: ["L","L","D","L","W"] },
  GUA: { elo: 1542, color: "#4997D0", form: ["W","L","D","L","L"] },
  HON: { elo: 1528, color: "#0073CF", form: ["L","D","L","W","L"] },
  PAN: { elo: 1598, color: "#D21034", form: ["D","W","L","D","L"] },
  JAM: { elo: 1578, color: "#000000", form: ["L","W","D","L","W"] },
  NZL: { elo: 1548, color: "#00247D", form: ["D","L","W","D","L"] },
  GRE: { elo: 1698, color: "#0D5EAF", form: ["W","D","W","L","W"] },
  NOR: { elo: 1812, color: "#EF2B2D", form: ["W","W","D","W","L"] },
  SCO: { elo: 1742, color: "#003DA5", form: ["W","D","W","W","L"] },
  WAL: { elo: 1686, color: "#C8102E", form: ["L","D","W","L","D"] },
  IRL: { elo: 1668, color: "#169B62", form: ["D","W","L","D","W"] },
  ROM: { elo: 1724, color: "#002B7F", form: ["W","W","D","L","W"] },
  UKR: { elo: 1788, color: "#005BBB", form: ["W","W","D","W","L"] },
  CRO: { elo: 1862, color: "#FF0000", form: ["W","D","W","D","L"] },
  HUN: { elo: 1726, color: "#CE2939", form: ["D","W","L","W","D"] },
  GEO: { elo: 1712, color: "#FF0000", form: ["W","D","L","W","D"] },
  MLI: { elo: 1628, color: "#009A00", form: ["D","W","L","D","W"] },
  // Additional WC 2026 qualifiers
  HAI: { elo: 1528, color: "#003087", form: ["L","D","W","L","D"] },
  CUW: { elo: 1512, color: "#003087", form: ["D","L","W","D","L"] },
  SWE: { elo: 1832, color: "#006AA7", form: ["W","W","D","W","L"] },
  CPV: { elo: 1598, color: "#003893", form: ["D","W","L","D","W"] },
  URY: { elo: 1842, color: "#5EB6E4", form: ["D","W","W","L","W"] }, // same as URU
  IRQ: { elo: 1638, color: "#007A3D", form: ["W","D","L","W","D"] },
  ALG: { elo: 1732, color: "#006233", form: ["W","W","D","L","W"] },
  JOR: { elo: 1588, color: "#007A3D", form: ["D","L","W","D","L"] },
  AUT: { elo: 1812, color: "#ED2939", form: ["W","D","W","W","L"] },
  UZB: { elo: 1618, color: "#1EB53A", form: ["W","D","L","W","D"] },
};

interface FDTeam { id: number; name: string; shortName: string; tla: string }
interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  minute?: number;
  stage: string;
  group?: string;
  venue?: string;
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

function mapStatus(s: string): Match["status"] {
  if (s === "IN_PLAY")  return "live";
  if (s === "PAUSED")   return "halftime";
  if (s === "FINISHED") return "finished";
  return "scheduled";
}

function buildTeam(fd: FDTeam, group: string): Team {
  const tla = fd.tla ?? "TBD";
  const name = fd.name ?? "TBD";
  const meta = TEAM_META[tla] ?? {
    elo: 1600, color: "#888888",
    form: ["W","D","L","W","D"] as ("W"|"D"|"L")[],
  };
  return {
    id:           tla.toLowerCase(),
    name,
    shortName:    fd.shortName || name,
    code:         tla,
    flag:         flagUrl(tla),
    group,
    elo:          meta.elo,
    form:         meta.form,
    goalsFor:     0,
    goalsAgainst: 0,
    points:       0,
    color:        meta.color,
  };
}

function parseGroup(g?: string): string {
  // handles "Group A", "GROUP_A", "GROUP A" all from football-data API
  const m = (g ?? "").match(/group[_\s]([A-Z])/i);
  return m ? m[1].toUpperCase() : (g ?? "?");
}

function buildMatch(fd: FDMatch): Match {
  const group = parseGroup(fd.group);
  return {
    id:          `fd-${fd.id}`,
    homeTeam:    buildTeam(fd.homeTeam, group),
    awayTeam:    buildTeam(fd.awayTeam, group),
    group,
    stage:       fd.stage === "GROUP_STAGE" ? "Group Stage" : fd.stage,
    kickoff:     fd.utcDate,
    venue:       fd.venue || "TBD",
    city:        "TBD",
    country:     "USA",
    status:      mapStatus(fd.status),
    homeScore:   fd.score.fullTime.home  ?? undefined,
    awayScore:   fd.score.fullTime.away  ?? undefined,
    minute:      fd.minute,
    totalVolume: 0,
    marketCount: 0,
  };
}

export async function fetchWorldCupMatches(): Promise<Match[]> {
  const token = process.env.FOOTBALL_DATA_API_KEY;

  if (!token) {
    console.warn("[football-api] No FOOTBALL_DATA_API_KEY set — returning empty match list");
    return [];
  }

  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      {
        headers: { "X-Auth-Token": token },
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) {
      console.error(`[football-api] ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    return (data.matches ?? []).map(buildMatch);
  } catch (err) {
    console.error("[football-api] Fetch failed:", err);
    return [];
  }
}

interface FDStandingRow {
  position: number;
  team: { name: string; shortName: string; tla: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface FDStandingGroup {
  stage: string;
  type: string;
  group: string | null;
  table: FDStandingRow[];
}

export async function fetchWorldCupStandings(): Promise<GroupStanding[]> {
  const token = process.env.FOOTBALL_DATA_API_KEY;

  if (!token) {
    console.warn("[football-api] No FOOTBALL_DATA_API_KEY set — returning empty standings");
    return [];
  }

  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/standings",
      {
        headers: { "X-Auth-Token": token },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error(`[football-api] standings ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    const groups: FDStandingGroup[] = data.standings ?? [];

    return groups
      .filter((g) => g.type === "TOTAL" && g.group)
      .map((g) => ({
        group: parseGroup(g.group ?? ""),
        table: g.table.map((row) => ({
          position: row.position,
          team: {
            name: row.team.name,
            shortName: row.team.shortName || row.team.name,
            tla: row.team.tla,
            flag: flagUrl(row.team.tla),
          },
          playedGames: row.playedGames,
          won: row.won,
          draw: row.draw,
          lost: row.lost,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDifference: row.goalDifference,
          points: row.points,
        })),
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  } catch (err) {
    console.error("[football-api] standings fetch failed:", err);
    return [];
  }
}
