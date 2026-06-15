import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Download, Dice6, Trophy, Globe, Zap, Brain, Code2,
  CheckCircle2, Circle, Clock, type LucideIcon,
} from "lucide-react";

interface Milestone {
  title: string;
  detail: string;
  status: "done" | "active" | "upcoming";
}

interface Phase {
  phase: string;
  label: string;
  dateRange: string;
  color: string;
  icon: LucideIcon;
  milestones: Milestone[];
}

const PHASES: Phase[] = [
  {
    phase: "Phase 1",
    label: "MVP Launch",
    dateRange: "Jun 10 – Jul 9, 2026",
    color: "bb-blue",
    icon: Zap,
    milestones: [
      { title: "Roulette game mode", detail: "First on-chain game beyond prediction markets — provably fair roulette on Base with USDC wagers and instant settlement.", status: "active" },
      { title: "BASEBETZ live on Base mainnet", detail: "Full platform deployed — wallet connect, USDC markets, oracle settlement, dispute window, and claim flow.", status: "done" },
      { title: "FIFA World Cup 2026 group stage", detail: "48 group-stage matches across 12 groups fully listed with match-winner and BTTS markets.", status: "done" },
      { title: "Portfolio & leaderboard live", detail: "Real-time P&L tracking, win rate, and ROI rankings for all connected wallets.", status: "done" },
      { title: "Oracle auto-finalization", detail: "Background worker calls settleMkt() automatically after dispute window — no manual intervention.", status: "done" },
    ],
  },
  {
    phase: "Phase 2",
    label: "World Cup Finals",
    dateRange: "Jul 10 – Aug 9, 2026",
    color: "bb-gold",
    icon: Trophy,
    milestones: [
      { title: "Round of 32 & Round of 16 markets", detail: "Knockout-stage match markets open as soon as group-stage qualifiers are confirmed.", status: "upcoming" },
      { title: "Quarter-final & Semi-final bracket markets", detail: "Bracket survival and finalist-path markets with tournament-wide settlement logic.", status: "upcoming" },
      { title: "World Cup Final & champion markets", detail: "Tournament winner, golden boot, and top-scorer markets settle post-final.", status: "upcoming" },
      { title: "Creator market rooms (beta)", detail: "Verified creators can launch custom commentary rooms around live markets.", status: "upcoming" },
      { title: "Roulette v2 — multi-table support", detail: "Additional table variants and higher-limit rooms based on phase 1 feedback.", status: "upcoming" },
    ],
  },
  {
    phase: "Phase 3",
    label: "Club Football Season",
    dateRange: "Aug 10 – Sep 9, 2026",
    color: "bb-green",
    icon: Globe,
    milestones: [
      { title: "Premier League 2026/27 season markets", detail: "Weekly match-winner, both-teams-to-score, and total-goals markets for all EPL fixtures.", status: "upcoming" },
      { title: "La Liga & Serie A listings", detail: "Expand beyond FIFA to the two next-largest European leagues for continuous coverage.", status: "upcoming" },
      { title: "Bundesliga & Ligue 1 markets", detail: "German and French top-flight fixtures added to the market calendar.", status: "upcoming" },
      { title: "UEFA Champions League qualifiers", detail: "Play-off round and group-stage draw markets open ahead of the new UCL season.", status: "upcoming" },
      { title: "Multi-outcome market types", detail: "Correct-score bands, first-goalscorer markets, and half-time/full-time results.", status: "upcoming" },
    ],
  },
  {
    phase: "Phase 4",
    label: "European Football Deep Dive",
    dateRange: "Sep 10 – Oct 9, 2026",
    color: "bb-teal",
    icon: Globe,
    milestones: [
      { title: "Champions League group stage", detail: "All 36 UCL group-stage fixtures listed with match and qualification markets.", status: "upcoming" },
      { title: "Europa League & Conference League", detail: "Full UEFA club competition calendar live on BASEBETZ.", status: "upcoming" },
      { title: "International break — World Cup qualifiers", detail: "UEFA, CONMEBOL, and CAF qualifying matches added during international windows.", status: "upcoming" },
      { title: "Copa America & AFCON qualifier markets", detail: "Expand beyond Europe to cover the full global football calendar.", status: "upcoming" },
      { title: "Advanced analytics dashboard (beta)", detail: "Probability movers, volume heatmaps, and team intelligence cards open to early access.", status: "upcoming" },
    ],
  },
  {
    phase: "Phase 5",
    label: "Intelligence Layer",
    dateRange: "Oct 10 – Nov 9, 2026",
    color: "bb-teal",
    icon: Brain,
    milestones: [
      { title: "AI Analytics dashboard — full launch", detail: "Gemini-powered match analysis, probability signals, injury impact, and expert consensus cards go live for all users.", status: "upcoming" },
      { title: "Live in-game micro markets (beta)", detail: "First real-time markets — next goal, comeback probability — gated to verified users while oracle reliability is proven.", status: "upcoming" },
      { title: "Odds comparison feed", detail: "Display model probability vs. live market price to surface disagreement signals.", status: "upcoming" },
      { title: "Mobile-optimised experience", detail: "Full responsive rebuild of the trading terminal for on-the-go match-day use.", status: "upcoming" },
      { title: "New game modes", detail: "Additional provably-fair game formats alongside roulette — early designs announced to community.", status: "upcoming" },
    ],
  },
  {
    phase: "Phase 6",
    label: "Ecosystem & Scale",
    dateRange: "Nov 10 – Dec 10, 2026",
    color: "bb-gold",
    icon: Code2,
    milestones: [
      { title: "BASEBETZ developer API launch", detail: "Public API for odds data, market state, and settlement history — enables third-party integrations.", status: "upcoming" },
      { title: "Creator league programme", detail: "Incentivised analyst leaderboard with verified prediction tracks and reward tiers.", status: "upcoming" },
      { title: "Governance exploration", detail: "Community forum on token utility, fee routing, and market governance — no token launch without liquidity and legal validation.", status: "upcoming" },
      { title: "Cross-chain bridge (Ethereum mainnet)", detail: "USDC deposits from Ethereum L1 for users who have not yet migrated to Base.", status: "upcoming" },
      { title: "Season 2 roadmap reveal", detail: "2027 club-football season, African Cup, Asian Cup, and extended game catalogue announced.", status: "upcoming" },
    ],
  },
];

const STATUS_ICON = {
  done:     <CheckCircle2 size={14} className="text-bb-green flex-shrink-0 mt-0.5" />,
  active:   <Zap          size={14} className="text-bb-gold  flex-shrink-0 mt-0.5" />,
  upcoming: <Circle       size={14} className="text-bb-text-3 flex-shrink-0 mt-0.5" />,
};

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; pill: string }> = {
  "bb-blue":  { border: "border-bb-blue/30",  bg: "bg-bb-blue/6",  text: "text-bb-blue",  pill: "bg-bb-blue/10 text-bb-blue border-bb-blue/25" },
  "bb-gold":  { border: "border-bb-gold/30",  bg: "bg-bb-gold/6",  text: "text-bb-gold",  pill: "bg-bb-gold/10 text-bb-gold border-bb-gold/25" },
  "bb-green": { border: "border-bb-green/30", bg: "bg-bb-green/6", text: "text-bb-green", pill: "bg-bb-green/10 text-bb-green border-bb-green/25" },
  "bb-teal":  { border: "border-bb-teal/30",  bg: "bg-bb-teal/6",  text: "text-bb-teal",  pill: "bg-bb-teal/10 text-bb-teal border-bb-teal/25" },
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1100px] mx-auto w-full px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-bb-gold font-mono text-xs uppercase tracking-[0.3em] mb-2">Jun 10 – Dec 10, 2026</p>
            <h1 className="font-display font-black text-5xl text-bb-text mb-2">
              PRODUCT <span className="text-bb-blue">ROADMAP</span>
            </h1>
            <p className="text-bb-text-3 text-sm font-mono max-w-lg">Six months of market expansion, new sports coverage, game modes, and platform intelligence. Built on Base.</p>
          </div>

          {/* Download whitepaper */}
          <Link
            href="/whitepaper"
            target="_blank"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl border border-bb-gold/35 bg-bb-gold/8 text-bb-gold font-heading font-semibold text-sm uppercase tracking-wide hover:bg-bb-gold/14 hover:border-bb-gold/55 transition-all group"
          >
            <Download size={15} className="group-hover:translate-y-0.5 transition-transform" />
            Download Whitepaper
          </Link>
        </div>

        {/* Timeline progress bar */}
        <div className="mb-12 panel p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-bb-text-3 text-[10px] font-mono uppercase tracking-wider">Timeline Progress</span>
            <span className="text-bb-blue text-[10px] font-mono">Phase 1 of 6 · Active</span>
          </div>
          <div className="h-2 bg-bb-border rounded-full overflow-hidden">
            <div className="h-full w-[8%] bg-gradient-to-r from-bb-blue to-bb-gold rounded-full" />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] font-mono text-bb-text-3">Jun 10, 2026</span>
            <span className="text-[10px] font-mono text-bb-text-3">Dec 10, 2026</span>
          </div>
        </div>

        {/* Roulette launch highlight */}
        <div className="mb-10 rounded-2xl border border-bb-gold/35 bg-gradient-to-r from-bb-gold/8 to-bb-navy/40 p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl border border-bb-gold/30 bg-bb-gold/10 flex items-center justify-center flex-shrink-0">
            <Dice6 size={28} className="text-bb-gold" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-bb-gold border border-bb-gold/35 px-2 py-0.5 rounded-full">New · Phase 1</span>
              <span className="text-[10px] font-mono text-bb-text-3">Coming Jun 2026</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-bb-text mb-1">Roulette on Base</h3>
            <p className="text-bb-text-3 text-sm font-mono">Provably fair on-chain roulette with USDC wagers, instant settlement, and verifiable randomness — BASEBETZ's first game mode beyond prediction markets.</p>
          </div>
        </div>

        {/* Phase cards */}
        <div className="space-y-8">
          {PHASES.map((p, i) => {
            const c = COLOR_MAP[p.color] ?? COLOR_MAP["bb-blue"];
            const Icon = p.icon;
            const isActive = i === 0;
            return (
              <div key={p.phase} className={`rounded-2xl border ${c.border} ${isActive ? c.bg : "bg-white/40"} overflow-hidden`}>
                {/* Phase header */}
                <div className={`flex items-center gap-4 px-6 py-4 border-b ${c.border}`}>
                  <div className={`w-10 h-10 rounded-lg border ${c.border} ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={c.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-mono font-bold uppercase tracking-widest ${c.text}`}>{p.phase}</span>
                      <h3 className="font-heading font-bold text-base text-bb-text">{p.label}</h3>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-bb-green/30 bg-bb-green/8 text-bb-green font-mono text-[9px] font-bold uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-bb-green animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-bb-text-3 text-[11px] font-mono mt-0.5 flex items-center gap-1">
                      <Clock size={9} />
                      {p.dateRange}
                    </p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-mono font-semibold uppercase tracking-wide ${c.pill}`}>
                    {p.milestones.filter(m => m.status === "done").length}/{p.milestones.length} done
                  </span>
                </div>

                {/* Milestones */}
                <div className="divide-y divide-bb-border/40">
                  {p.milestones.map((m) => (
                    <div key={m.title} className="flex items-start gap-3 px-6 py-3.5 hover:bg-bb-navy/10 transition-colors">
                      {STATUS_ICON[m.status]}
                      <div className="min-w-0">
                        <p className={`text-sm font-heading font-semibold ${m.status === "done" ? "text-bb-text line-through opacity-60" : "text-bb-text"}`}>
                          {m.title}
                        </p>
                        <p className="text-bb-text-3 text-xs font-mono mt-0.5 leading-relaxed">{m.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 panel p-5 rounded-xl text-center">
          <p className="text-bb-text-3 text-xs font-mono">
            This roadmap reflects planned development priorities and may evolve based on market conditions, regulatory requirements, and community feedback.
            All dates are targets, not guarantees.
          </p>
          <div className="flex items-center justify-center gap-6 mt-3">
            {[
              { icon: CheckCircle2, label: "Completed",  color: "text-bb-green" },
              { icon: Zap,          label: "In Progress", color: "text-bb-gold" },
              { icon: Circle,       label: "Upcoming",   color: "text-bb-text-3" },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-[10px] font-mono text-bb-text-3">
                <Icon size={11} className={color} />
                {label}
              </span>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
