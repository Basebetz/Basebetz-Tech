"use client";
import { useRef } from "react";
import Link from "next/link";
import { Download, ArrowLeft, ExternalLink } from "lucide-react";

export default function WhitepaperPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print styles injected inline for reliability */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-page { max-width: 100% !important; padding: 0 !important; }
          .page-break { page-break-before: always; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>

      {/* Top bar — hidden when printing */}
      <div className="no-print sticky top-0 z-50 w-full border-b border-bb-border bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/roadmap" className="flex items-center gap-2 text-bb-text-3 hover:text-bb-blue text-sm font-mono transition-colors">
            <ArrowLeft size={14} />
            Back to Roadmap
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-bb-text-3 text-xs font-mono">BASEBETZ Whitepaper v1.0 · June 2026</span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-bb-blue text-white text-xs font-heading font-semibold uppercase tracking-wide hover:bg-bb-blue/90 transition-colors"
            >
              <Download size={12} />
              Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Document body */}
      <div ref={contentRef} className="print-page bg-white min-h-screen">
        <div className="max-w-[860px] mx-auto px-8 py-16">

          {/* Cover */}
          <div className="text-center mb-20 pb-16 border-b-2 border-[#0a1628]">
            <p className="text-[11px] font-mono text-gray-400 uppercase tracking-[0.3em] mb-8 text-right">BASEBETZ | Base FIFA Prediction Markets</p>
            <h1 className="font-display font-black text-6xl text-[#0052FF] mb-6 tracking-tight">BASEBETZ</h1>
            <h2 className="text-2xl font-bold text-[#0a1628] mb-5">Prediction Markets on Base for Football Games</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed mb-14">
              A compliance-first, onchain sports forecasting terminal where users trade transparent match outcome markets using Base-native infrastructure.
            </p>
            <table className="w-full border-collapse text-sm text-left mx-auto max-w-lg">
              <tbody>
                {[
                  ["Project Name",     "BASEBETZ"],
                  ["Network",          "Base, EVM Layer 2"],
                  ["Core Category",    "Sports prediction markets / football forecasting"],
                  ["Initial Vertical", "FIFA World Cup 2026 fixtures, group-stage and knockout markets"],
                  ["Primary Users",    "Football fans, crypto-native traders, sports data analysts, Base ecosystem users"],
                  ["Document Version", "v1.0 · June 2026"],
                ].map(([k, v]) => (
                  <tr key={k} className="border border-gray-200">
                    <td className="py-2.5 px-4 font-semibold bg-[#0a1628] text-white w-44 text-xs">{k}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-10 border-l-4 border-[#0052FF] bg-[#0052FF]/5 px-6 py-4 text-left max-w-lg mx-auto">
              <p className="text-xs font-bold text-[#0052FF] uppercase tracking-wider mb-1">Positioning Line</p>
              <p className="text-gray-700 text-sm">BASEBETZ turns FIFA match conviction into liquid, transparent, onchain markets on Base.</p>
            </div>
            <p className="text-[10px] text-gray-300 mt-16">Confidential project document · BASEBETZ</p>
          </div>

          {/* Section helper */}
          {/* 1. Executive Summary */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">1. Executive Summary</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              <strong>BASEBETZ</strong> is a Base-native prediction market platform built around football games, beginning with the 2026 tournament calendar. The product lets users take positions on match outcomes, tournament paths, group qualification, player/team events, and live in-game probability shifts through transparent smart contracts and oracle-based settlement.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              <strong>The strategic opportunity:</strong> sports prediction markets sit between fandom, data, trading, and social entertainment. Instead of traditional sportsbook odds hidden behind centralised pricing, BASEBETZ creates user-priced markets where probabilities are visible, tradable, and shaped by live information: team news, injuries, historical performance, expert consensus, player statistics, weather, and market flow.
            </p>
            <div className="border border-gray-200 rounded p-4 mb-6 bg-gray-50">
              <p className="text-xs font-bold text-[#0a1628] mb-1">Core thesis</p>
              <p className="text-sm text-gray-700">The next great sports product is not a sportsbook. It is a live conviction market: social, onchain, data-rich, and built for global football culture.</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                ["Why Base:", "Low-cost EVM execution, strong consumer onboarding narrative, Coinbase ecosystem proximity, and compatibility with Ethereum tooling."],
                ["Why Football:", "The 2026 tournament expands to 48 teams and 104 matches, creating a long, high-volume global event window."],
                ["Why prediction markets:", "They convert sports opinions into transparent probabilities and allow users to trade in and out before final settlement."],
                ["Why now:", "Prediction markets are increasingly mainstream, but sports markets require strong compliance, user protection, and jurisdiction controls."],
              ].map(([label, text]) => (
                <li key={label as string} className="flex gap-2">
                  <span className="font-bold text-[#0a1628] flex-shrink-0">{label}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 2. Market Context */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">2. Market Context</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              Prediction markets have moved from niche crypto experiments into mainstream financial and media conversation. Users understand the format: each market represents a future event, the market price implies probability, and the final outcome determines settlement. For sports, this creates a more interactive format than static betting because users can enter, exit, hedge, and watch probabilities evolve as the game approaches.
            </p>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">2.1 FIFA 2026 Event Window</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              The 2026 FIFA World Cup creates a uniquely large event surface for BASEBETZ. The tournament features 48 teams, 12 groups of four, a Round of 32, and 104 total matches. This structure supports pre-tournament markets, group-stage markets, knockout-bracket markets, match markets, and live narrative markets across the full tournament cycle.
            </p>
            <table className="w-full border-collapse text-sm mb-6">
              <tbody>
                {[
                  ["Pre-tournament",    "Champion, finalist, top scorer, group winners, team qualification, regional performance."],
                  ["Group stage",       "Match winner, draw/no draw, total goals bands, both teams to score, group qualification."],
                  ["Knockout stage",    "Advance to next round, penalty shootout likelihood, finalist path, bracket survival."],
                  ["Live market layer", "Next goal, comeback probability, win probability after key events, momentum markets."],
                ].map(([k, v]) => (
                  <tr key={k} className="border border-gray-200">
                    <td className="py-2.5 px-4 font-semibold bg-[#0a1628] text-white w-44 text-xs">{k}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">2.2 Base Ecosystem Fit</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Base is an EVM-compatible Layer 2 using the OP Stack, making it accessible to Ethereum developers while providing cheaper execution than Ethereum mainnet. BASEBETZ leans into this by prioritising simple wallet onboarding, USDC-based markets, fast interaction UX, and transparent settlement records.
            </p>
          </section>

          {/* 3. Product Vision */}
          <section className="mb-14 page-break">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">3. Product Vision</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              BASEBETZ should feel like a Bloomberg Terminal, FIFA companion app, and onchain trading terminal combined into one sports-native interface. The user should never feel like they are using a casino skin. They should feel like they are reading the market, watching football intelligence update in real time, and taking a view based on data.
            </p>
            <div className="border-l-4 border-[#0052FF] bg-[#0052FF]/5 px-5 py-4 mb-6">
              <p className="text-xs font-bold text-[#0052FF] uppercase tracking-wider mb-1">Product promise</p>
              <p className="text-sm text-gray-700">A live football intelligence market where every match has a tradable probability curve.</p>
            </div>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">3.1 User Experience Pillars</h3>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              {[
                ["Trade the match:", "Simple YES/NO or outcome shares for match results, qualification events, and tournament events."],
                ["Understand the odds:", "Show implied probability, market depth, recent trades, and probability movement over time."],
                ["Use real intelligence:", "Aggregate team news, player stats, injury updates, expert models, and historical performance into market context cards."],
                ["Settle transparently:", "Use oracle-confirmed outcomes and public settlement logic so users can verify final results."],
                ["Stay social:", "Let users share positions, leaderboards, match rooms, and creator market commentary."],
              ].map(([label, text]) => (
                <li key={label as string} className="flex gap-2">
                  <span className="font-bold text-[#0a1628] flex-shrink-0">{label}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">3.2 Core Screens</h3>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {[
                  ["Home Terminal",        "Live FIFA market dashboard with upcoming games, trending markets, probability movers, liquidity, and news triggers."],
                  ["Match Market Page",    "One match hub with odds chart, order book, team stats, news, expert cards, and available outcome markets."],
                  ["Portfolio",           "Open positions, average entry, unrealised P/L, claimable settlements, and risk exposure by team or market."],
                  ["Create/Request Market","Community market requests gated by templates, moderation, and compliance checks."],
                  ["Leaderboards",        "Top forecasters, ROI rankings, streaks, and verified analysts."],
                ].map(([k, v]) => (
                  <tr key={k} className="border border-gray-200">
                    <td className="py-2.5 px-4 font-semibold bg-[#0a1628] text-white w-52 text-xs">{k}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 4. Market Design */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">4. Market Design</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              BASEBETZ should begin with simple, easy-to-understand markets and only expand into complex live markets after liquidity, settlement, and compliance systems are proven.
            </p>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">4.1 Market Types</h3>
            <table className="w-full border-collapse text-sm mb-6">
              <thead>
                <tr className="bg-[#0a1628] text-white">
                  <th className="py-2.5 px-4 text-left text-xs font-semibold">Market Type</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold">Example</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold">Settlement Logic</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Binary Event",        "Will Brazil beat Germany?",                  "YES / NO shares settle to 1 or 0."],
                  ["Categorical Outcome", "Match result?",                              "Team A / Draw / Team B."],
                  ["Qualification Market","Will Team A reach the Round of 16?",         "Settles after group-stage confirmation."],
                  ["Tournament Market",   "Will Team A win the tournament?",            "Long-duration market with high narrative value."],
                  ["Player Market",       "Will Player X score 3+ goals in tournament?","Requires official player/stat feed."],
                  ["Live Micro Market",   "Will there be another goal before minute 75?","Advanced; launch only after live oracle reliability is proven."],
                ].map(([type, ex, logic]) => (
                  <tr key={type as string} className="border border-gray-200 even:bg-gray-50">
                    <td className="py-2.5 px-4 text-xs font-semibold text-[#0a1628]">{type}</td>
                    <td className="py-2.5 px-4 text-xs text-gray-600">{ex}</td>
                    <td className="py-2.5 px-4 text-xs text-gray-600">{logic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">4.2 Recommended Launch Markets</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 mb-6">
              <li>Match winner markets for every group-stage game.</li>
              <li>Team qualification markets for all 48 teams.</li>
              <li>Group winner markets for all 12 groups.</li>
              <li>Tournament winner and finalist markets.</li>
              <li>Top scorer and clean sheet markets only if reliable official data feeds are secured.</li>
            </ul>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">4.3 Pricing and Liquidity Model</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              The simplest market model is a central limit order book using outcome tokens. Users buy or sell YES/NO shares, and the displayed price becomes the implied probability. For early MVP liquidity, BASEBETZ can use a hybrid model: sponsored initial liquidity, market-maker incentives, and creator-led featured markets.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                ["Primary collateral:", "USDC on Base for stable denomination and clear user understanding."],
                ["Fee model:", "Small trading fee plus optional market-creation fee; avoid hidden spreads."],
                ["Liquidity incentives:", "Reward market makers, analysts, and early LPs based on depth, uptime, and responsible liquidity provision."],
                ["Risk controls:", "Limit max position size for new users, block restricted jurisdictions, and pause markets on oracle disputes."],
              ].map(([label, text]) => (
                <li key={label as string} className="flex gap-2">
                  <span className="font-bold text-[#0a1628] flex-shrink-0">{label}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Football Intelligence Layer */}
          <section className="mb-14 page-break">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">5. Football Intelligence Layer</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              The intelligence layer is what separates BASEBETZ from a simple odds board. Each market page should provide context that helps users understand why probabilities move. This layer can be built as a modular data pipeline feeding match pages, creator commentary, and automated alerts.
            </p>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">5.1 Data Inputs</h3>
            <table className="w-full border-collapse text-sm mb-6">
              <tbody>
                {[
                  ["Team performance",  "Recent form, Elo-style ratings, xG trends, defensive/offensive strength, travel/rest days."],
                  ["Player stats",      "Starts, goals, assists, minutes, expected goals, injuries, cards, goalkeeper save rate."],
                  ["News signals",      "Injuries, suspensions, lineups, manager comments, training reports, weather, venue factors."],
                  ["Expert consensus",  "Analyst predictions, model averages, media narratives, verified creator forecasts."],
                  ["Market signals",    "Volume spikes, probability moves, liquidity changes, whale trades, disagreement between markets."],
                ].map(([k, v]) => (
                  <tr key={k} className="border border-gray-200">
                    <td className="py-2.5 px-4 font-semibold bg-[#0a1628] text-white w-44 text-xs">{k}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">5.2 Prediction Engine Positioning</h3>
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              BASEBETZ should not promise guaranteed predictions. The platform should present probabilistic forecasts, confidence bands, and explainable signals. The engine is a decision-support layer, not a certainty machine.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>Generate pre-match probability estimates from team and player data.</li>
              <li>Compare model probability against live market price to surface disagreement.</li>
              <li>Display plain-English signal cards: "Lineup strength improved", "High injury uncertainty", "Market overreacting to news".</li>
              <li>Track model performance publicly after settlement to build trust.</li>
            </ul>
          </section>

          {/* 6. Technical Architecture */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">6. Technical Architecture</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              BASEBETZ is designed as a modular protocol plus application layer. The smart contracts handle collateral, positions, market lifecycle, fee accounting, dispute windows, and settlement. The application layer handles discovery, analytics, alerts, social features, and compliance UX.
            </p>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">6.1 System Components</h3>
            <table className="w-full border-collapse text-sm mb-6">
              <tbody>
                {[
                  ["Frontend",         "Trading terminal, match pages, wallet connect, portfolio, leaderboard, analytics, compliance gating."],
                  ["Smart Contracts",  "Market factory, outcome token contracts, order book or AMM modules, settlement, fee vault, treasury."],
                  ["Oracle Layer",     "Official result feeds, redundancy providers, dispute mechanism, manual fallback governance for edge cases."],
                  ["Data Pipeline",    "Sports APIs, news ingestion, odds/probability archive, model engine, alerts, historical database."],
                  ["Indexer",          "Onchain event indexer for trades, positions, liquidity, settlement status, and user portfolio state."],
                  ["Risk/Compliance",  "Geo-blocking, KYC/age gates where required, suspicious activity monitoring, responsible use controls."],
                ].map(([k, v]) => (
                  <tr key={k} className="border border-gray-200">
                    <td className="py-2.5 px-4 font-semibold bg-[#0a1628] text-white w-44 text-xs">{k}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">6.2 Smart Contract Lifecycle</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700 mb-6">
              <li>Admin or approved creator deploys a market from a verified fixture template.</li>
              <li>Market receives metadata: event ID, market question, valid outcomes, opening time, closing time, settlement source, dispute window.</li>
              <li>Users deposit USDC and trade outcome shares through the market interface.</li>
              <li>Market closes before kickoff or according to live-market rules.</li>
              <li>Oracle posts result after official confirmation.</li>
              <li>Dispute window opens for a defined period if data is contested.</li>
              <li>Market settles and winning shares become claimable.</li>
              <li>Fees route to treasury, liquidity incentives, and optional creator rewards.</li>
            </ol>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">6.3 Oracle Requirements</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {[
                ["Official source priority:", "Settlement should reference official FIFA match data and licensed/statistically reliable data providers."],
                ["Redundancy:", "Use at least two independent data sources for important markets."],
                ["Dispute window:", "Allow short disputes for edge cases such as abandoned matches, delayed rulings, or player-stat corrections."],
                ["Clear rulebook:", "Every market template must define exact settlement rules before trading opens."],
              ].map(([label, text]) => (
                <li key={label as string} className="flex gap-2">
                  <span className="font-bold text-[#0a1628] flex-shrink-0">{label}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 7. Business Model */}
          <section className="mb-14 page-break">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">7. Business Model &amp; Token Design</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              BASEBETZ can operate without a token at MVP stage. A token should only be introduced if it has direct utility and does not increase regulatory risk. The first version should prioritise product-market fit, compliant access, liquidity, and trusted settlement.
            </p>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">7.1 Revenue Streams</h3>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              {[
                ["Trading fees:", "Small fee on filled trades, transparently displayed before execution."],
                ["Market creation fees:", "Fees for approved creators or partners launching featured markets."],
                ["Data/analytics tier:", "Premium intelligence dashboard for advanced users and creators."],
                ["Sponsorships:", "Football communities, Base ecosystem campaigns, creator leagues, tournament activations."],
                ["Liquidity partnerships:", "Fee-share incentives for professional liquidity providers where allowed."],
              ].map(([label, text]) => (
                <li key={label as string} className="flex gap-2">
                  <span className="font-bold text-[#0a1628] flex-shrink-0">{label}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">7.2 Optional Token Utility</h3>
            <div className="border border-[#B8920D]/40 bg-[#B8920D]/5 px-5 py-4 mb-4 rounded">
              <p className="text-xs font-bold text-[#B8920D] uppercase tracking-wider mb-1">Recommendation</p>
              <p className="text-sm text-gray-700">Do not launch a token before the MVP proves liquidity and regulatory fit. If used later, the token should support governance, rewards, staking for market creators, and fee discounts — not promise profit.</p>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>Market creator staking to reduce spam and align incentives.</li>
              <li>Governance over approved templates, fee routing, and grants.</li>
              <li>Reward emissions for liquidity depth, responsible market making, and accurate analyst contributions.</li>
              <li>Fee discounts or premium analytics access for active users.</li>
            </ul>
          </section>

          {/* 8. Compliance */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">8. Compliance &amp; Risk Framework</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Sports prediction markets can be treated as gambling, derivatives, event contracts, or prohibited activity depending on jurisdiction. BASEBETZ should be built as a compliance-first product from day one. This is not only legal protection; it also creates institutional credibility.
            </p>
            <div className="border border-red-400/40 bg-red-50 px-5 py-4 mb-6 rounded">
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Non-negotiable</p>
              <p className="text-sm text-gray-700">BASEBETZ must not launch unrestricted global sports markets without legal review, jurisdiction controls, age gating, and clear settlement terms.</p>
            </div>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">8.1 Compliance Controls</h3>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              {[
                ["Geo-restrictions:", "Block jurisdictions where sports prediction markets are not permitted or require licences."],
                ["Age verification:", "Require minimum-age confirmation and stronger verification in regulated regions."],
                ["KYC tiers:", "Use tiered access: view-only, low-limit, full access depending on location and legal requirements."],
                ["Responsible-use tools:", "Deposit limits, cooling-off periods, self-exclusion, risk disclosures, and P/L warnings."],
                ["Market template review:", "Only approved markets with objective settlement criteria should go live."],
                ["Dispute rules:", "Transparent dispute process and settlement governance for ambiguous outcomes."],
              ].map(([label, text]) => (
                <li key={label as string} className="flex gap-2">
                  <span className="font-bold text-[#0a1628] flex-shrink-0">{label}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">8.2 Brand &amp; IP Caution</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              BASEBETZ should avoid implying official FIFA endorsement unless a licence is secured. The product can reference publicly available football fixtures and "FIFA World Cup" context where legally permitted, but marketing should be reviewed for trademark compliance. A safer public phrase is "football prediction markets for global tournament games" until licensing clarity is obtained.
            </p>
          </section>

          {/* 9. MVP Scope */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">9. MVP Scope</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              The MVP should be narrow, credible, and liquidity-focused. The goal is not to launch every possible market; the goal is to prove that users will connect wallets, understand the interface, trade simple football outcomes, and trust settlement.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-bold text-[#0052FF] mb-3">9.1 MVP Features</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Wallet login and Base USDC deposit flow.</li>
                  <li>FIFA match dashboard with fixtures, countdowns, market status, and volume.</li>
                  <li>Binary and categorical match markets.</li>
                  <li>Basic order execution or AMM swap interface.</li>
                  <li>Portfolio and claim page.</li>
                  <li>Oracle settlement with dispute window.</li>
                  <li>Market stats: implied probability, volume, liquidity, price chart.</li>
                  <li>Compliance gate: location, age, risk disclosure, restricted-region handling.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-bold text-red-500 mb-3">9.2 MVP Exclusions</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>No live in-play micro markets until oracle and latency systems are proven.</li>
                  <li>No unrestricted user-created markets at launch.</li>
                  <li>No leverage, credit, or borrowing.</li>
                  <li>No token until product, liquidity, and legal model are validated.</li>
                  <li>No claims of guaranteed predictive accuracy.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 10. Roadmap */}
          <section className="mb-14 page-break">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">10. Roadmap</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#0a1628] text-white">
                  <th className="py-2.5 px-4 text-left text-xs font-semibold w-52">Phase</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold">Deliverables</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Phase 0 · Legal & Architecture", "Jurisdiction memo, market rulebook, data provider selection, contract architecture, Base deployment plan."],
                  ["Phase 1 · Closed Alpha",         "Testnet markets, mock fixtures, internal settlement, UI prototype, risk controls, analytics dashboard."],
                  ["Phase 2 · Mainnet Beta",         "Limited Base USDC markets, capped deposits, selected fixtures, manual backup settlement, invite-only users."],
                  ["Phase 3 · FIFA Launch Window",   "Full tournament dashboard, featured markets, creator rooms, leaderboards, liquidity campaigns, social sharing."],
                  ["Phase 4 · Multi-Sport Expansion","Club football (EPL, La Liga, Serie A, Bundesliga), international tournaments, roulette game mode, creator market ecosystem."],
                  ["Phase 5 · Intelligence & API",   "AI analytics dashboard live, developer API launch, odds comparison feeds, creator league programme, governance exploration."],
                ].map(([phase, deliverables]) => (
                  <tr key={phase as string} className="border border-gray-200 even:bg-gray-50">
                    <td className="py-3 px-4 text-xs font-bold text-[#0a1628] align-top">{phase}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{deliverables}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 11. Brand */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">11. Brand Direction</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              BASEBETZ should use a sharp, high-contrast identity that feels closer to a trading terminal than a casino. The visual system should combine Base blue, deep navy, white, and electric data accents. Typography should be bold, condensed, and scoreboard-inspired, with terminal-style panels and probability charts.
            </p>
            <table className="w-full border-collapse text-sm mb-5">
              <tbody>
                {[
                  ["Name",          "BASEBETZ — always uppercase in official materials."],
                  ["Tagline",       "Trade the Game. / Football Markets on Base. / Where Match Conviction Trades."],
                  ["Visual tone",   "Terminal-grade, liquid, fast, data-rich, football-native."],
                  ["Avoid",         "Casino tropes, slot-machine graphics, irresponsible gambling language, fake guarantees."],
                ].map(([k, v]) => (
                  <tr key={k} className="border border-gray-200">
                    <td className="py-2.5 px-4 font-semibold bg-[#0a1628] text-white w-44 text-xs">{k}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="text-lg font-bold text-[#0052FF] mb-3">11.1 Hero Copy</h3>
            <div className="border-l-4 border-[#0052FF] bg-[#0052FF]/5 px-5 py-4">
              <p className="text-sm text-gray-700">BASEBETZ is the onchain prediction market for football games on Base. Trade match outcomes, team qualification, and tournament narratives with transparent pricing, real-time stats, and verifiable settlement.</p>
            </div>
          </section>

          {/* 12. Success Metrics */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">12. Success Metrics</h2>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {[
                  ["Liquidity",     "Market depth per fixture, bid/ask spread, filled volume, number of active market makers."],
                  ["User activity", "Connected wallets, first trades, repeat trades, watchlists, portfolio claims."],
                  ["Trust",         "Settlement speed, dispute rate, oracle accuracy, support tickets per market."],
                  ["Engagement",    "Time on match pages, social shares, creator room activity, leaderboard participation."],
                  ["Compliance",    "Blocked restricted access, completed verification flows, responsible-use tool engagement."],
                ].map(([k, v]) => (
                  <tr key={k} className="border border-gray-200">
                    <td className="py-2.5 px-4 font-semibold bg-[#0a1628] text-white w-44 text-xs">{k}</td>
                    <td className="py-2.5 px-4 text-gray-700 text-xs">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 13. Key Risks */}
          <section className="mb-14 page-break">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">13. Key Risks &amp; Mitigations</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#0a1628] text-white">
                  <th className="py-2.5 px-4 text-left text-xs font-semibold">Risk</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold">Issue</th>
                  <th className="py-2.5 px-4 text-left text-xs font-semibold">Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Regulatory risk",   "Sports markets may be restricted or require licences.", "Launch with legal review, jurisdiction gating, age/KYC controls, and limited market access."],
                  ["Oracle failure",    "Incorrect or delayed match settlement damages trust.", "Use redundant data sources, dispute windows, and clearly defined fallback processes."],
                  ["Low liquidity",     "Thin markets create bad user experience.", "Seed liquidity, incentivise makers, launch fewer markets with deeper books."],
                  ["IP/trademark risk", "Misuse of FIFA branding can create legal exposure.", "Avoid official endorsement claims and review all tournament branding."],
                  ["User harm",         "Sports markets can encourage impulsive risk-taking.", "Use limits, warnings, self-exclusion, cooling-off, and no leverage."],
                ].map(([risk, issue, mitigation]) => (
                  <tr key={risk as string} className="border border-gray-200 even:bg-gray-50">
                    <td className="py-3 px-4 text-xs font-bold text-[#0a1628] align-top">{risk}</td>
                    <td className="py-3 px-4 text-xs text-gray-600 align-top">{issue}</td>
                    <td className="py-3 px-4 text-xs text-gray-600 align-top">{mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 14. Final Summary */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-[#0a1628] mb-5 pb-2 border-b border-gray-200">14. Final Product Summary</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              BASEBETZ is a Base-native football prediction market platform designed for FIFA match outcomes and tournament narratives. It should launch as a simple, trusted, USDC-based market platform with transparent pricing, strict compliance gates, verified settlement, and a data-rich interface. The long-term vision is to become the default onchain sports forecasting terminal: a place where fans and analysts do not just watch the game — they trade the probability of the game.
            </p>
            <div className="border-l-4 border-[#0052FF] bg-[#0052FF]/5 px-6 py-5">
              <p className="text-xs font-bold text-[#0052FF] uppercase tracking-wider mb-2">One-sentence pitch</p>
              <p className="text-base font-semibold text-[#0a1628]">BASEBETZ is the Base-native football prediction market where FIFA match conviction becomes liquid, transparent, and tradable.</p>
            </div>
          </section>

          {/* Source Notes */}
          <section className="border-t border-gray-200 pt-8 pb-16">
            <h3 className="text-base font-bold text-[#0a1628] mb-4">Source Notes</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
              <li>Base documentation: Base network and developer resources; Base network fees describe L2 execution and L1 security fee components.</li>
              <li>Optimism documentation: OP Stack is an open-source modular Ethereum Layer 2 rollup stack with EVM compatibility and lower fees than mainnet.</li>
              <li>FIFA official tournament materials: FIFA World Cup 26 schedule and knockout-stage structure.</li>
              <li>Public regulatory context: prediction markets and sports event contracts remain legally sensitive and jurisdiction-dependent; compliance review is required before launch.</li>
            </ul>
            <p className="text-center text-[10px] text-gray-300 mt-12">Confidential project document · BASEBETZ · v1.0 · June 2026</p>
          </section>

        </div>
      </div>
    </>
  );
}
