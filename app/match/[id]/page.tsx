export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MatchHeader from "@/components/match/MatchHeader";
import TradingPanel from "@/components/match/TradingPanel";
import PriceChart from "@/components/match/PriceChart";
import OutcomePool from "@/components/match/OutcomePool";
import TeamStats from "@/components/match/TeamStats";
import AIPrediction from "@/components/match/AIPrediction";
import Badge from "@/components/ui/Badge";
import { fetchWorldCupMatches } from "@/lib/football-api";
import { getOrGeneratePrediction } from "@/lib/predictions";
import { getDb } from "@/lib/db";
import { ensureMarketsForMatches } from "@/lib/db-seed";
import { formatVolume, formatAddress } from "@/lib/utils";
import { format } from "date-fns";
import type { Market, TradeEvent } from "@/lib/types";

interface Params { params: { id: string } }

export default async function MatchPage({ params }: Params) {
  const matches = await fetchWorldCupMatches();
  const match = matches.find(m => m.id === params.id);
  if (!match) notFound();

  const db = await getDb();
  await ensureMarketsForMatches(db, matches);

  const marketDocs = await db
    .collection<Market>("markets")
    .find({ matchId: params.id })
    .toArray();
  const matchMarkets = marketDocs.map(({ _id, ...m }) => m as Market);

  const primaryMarket = matchMarkets[0];

  const tradeDocs = await db
    .collection<TradeEvent>("trades")
    .find({})
    .limit(20)
    .toArray();
  const trades = tradeDocs.map(({ _id, ...t }) => t as TradeEvent);

  const prediction = await getOrGeneratePrediction(match);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">

        <Link href="/" className="inline-flex items-center gap-2 text-bb-text-3 hover:text-bb-blue text-sm font-mono mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Markets
        </Link>

        <MatchHeader match={match} />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px_320px] gap-6">

          {/* Left: chart + order book + trades */}
          <div className="space-y-6">
            {primaryMarket && <PriceChart market={primaryMarket} />}

            {matchMarkets.length > 1 && (
              <div className="panel p-4">
                <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm mb-4">
                  All Markets ({matchMarkets.length})
                </h3>
                <div className="space-y-3">
                  {matchMarkets.map(market => (
                    <div key={market.id} className="flex items-center justify-between py-2 border-b border-bb-border last:border-0">
                      <div>
                        <p className="text-bb-text text-sm font-medium">{market.question}</p>
                        <div className="flex gap-1.5 mt-1">
                          {market.outcomes.map(o => (
                            <span key={o.id} className="text-[11px] font-mono text-bb-text-3">
                              {o.shortLabel} <span className="text-bb-text font-semibold">{(o.probability * 100).toFixed(0)}%</span>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={market.status === "live" ? "live" : market.status === "settled" ? "settled" : "open"}>
                          {market.status}
                        </Badge>
                        <p className="text-bb-text-3 text-xs font-mono mt-1">{formatVolume(market.totalVolume)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="panel p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Recent Trades</h3>
                <button className="text-bb-text-3 hover:text-bb-blue transition-colors">
                  <RefreshCw size={13} />
                </button>
              </div>
              {trades.length === 0 ? (
                <p className="text-bb-text-3 text-xs font-mono text-center py-6">No trades yet — be the first.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-bb-border bg-bb-navy/40">
                        {["Trader", "Side", "Outcome", "Shares", "Price", "Total", "Time"].map(h => (
                          <th key={h} className="px-2 py-2 text-left text-[10px] text-bb-text-3 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bb-border/40">
                      {trades.map(trade => (
                        <tr key={trade.id} className="hover:bg-bb-navy/40">
                          <td className="px-2 py-2 text-bb-text-2">{trade.displayName}</td>
                          <td className="px-2 py-2">
                            <Badge variant={trade.side === "YES" ? "green" : "red"} size="sm">{trade.side}</Badge>
                          </td>
                          <td className="px-2 py-2 text-bb-text font-medium">{trade.outcome}</td>
                          <td className="px-2 py-2 text-bb-text-2">{trade.shares}</td>
                          <td className="px-2 py-2 text-bb-text">${trade.price.toFixed(3)}</td>
                          <td className="px-2 py-2 text-bb-gold font-medium">${trade.total.toFixed(1)}</td>
                          <td className="px-2 py-2 text-bb-text-3">
                            {format(new Date(trade.timestamp), "HH:mm")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Center: trading panels + pool breakdown */}
          <div className="space-y-6">
            {primaryMarket && <TradingPanel market={primaryMarket} />}
            {primaryMarket && matchMarkets[1] && <TradingPanel market={matchMarkets[1]} />}
            {primaryMarket && <OutcomePool market={primaryMarket} />}
          </div>

          {/* Right: team stats */}
          <div className="space-y-6">
            {prediction && <AIPrediction prediction={prediction} />}
            <TeamStats home={match.homeTeam} away={match.awayTeam} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

