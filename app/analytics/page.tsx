"use client";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FlagImage from "@/components/ui/FlagImage";
import { Brain, AlertTriangle, TrendingUp, Zap, Search, X, ChevronDown, ChevronUp, Loader2, Lock, Cpu } from "lucide-react";

// ── Coming Soon gate ──────────────────────────────────────────────────────────
function ComingSoonGate() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-20 h-20 rounded-2xl border border-bb-teal/25 bg-bb-teal/6 flex items-center justify-center mb-6 relative">
          <Brain size={36} className="text-bb-teal" />
          <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full border border-bb-border bg-white flex items-center justify-center">
            <Lock size={12} className="text-bb-text-3" />
          </span>
        </div>
        <p className="text-bb-teal font-mono text-xs uppercase tracking-[0.3em] mb-3">Tech Update</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-bb-text mb-4 text-center">
          AI Analytics
        </h1>
        <p className="text-bb-text-2 text-base font-mono text-center max-w-md mb-10 leading-relaxed">
          Our AI prediction engine is currently being upgraded. The full intelligence layer — match signals, probability movers, injury impact, and expert consensus cards — will be available soon.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full mb-10">
          {[
            { icon: Cpu,        label: "Probability signals",  detail: "Model vs. market price disagreement" },
            { icon: TrendingUp, label: "Odds movers",         detail: "Volume spikes & probability shifts" },
            { icon: Brain,      label: "Match intelligence",  detail: "Team form, injuries, xG, lineups" },
          ].map(({ icon: Icon, label, detail }) => (
            <div key={label} className="panel p-4 rounded-xl opacity-50 select-none">
              <Icon size={16} className="text-bb-teal mb-2" />
              <p className="text-bb-text text-sm font-heading font-semibold">{label}</p>
              <p className="text-bb-text-3 text-[11px] font-mono mt-0.5">{detail}</p>
            </div>
          ))}
        </div>
        <span className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-bb-teal/25 bg-bb-teal/6 text-bb-teal font-mono text-sm text-center">
          <span className="w-2 h-2 rounded-full bg-bb-teal animate-pulse flex-shrink-0" />
          Coming soon — check the roadmap for the launch date
        </span>
      </main>
      <Footer />
    </div>
  );
}
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { StoredPrediction } from "@/lib/types";
import type { Match } from "@/lib/types";

function ConfidenceBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-bb-border overflow-hidden flex-1">
      <div
        className={cn("h-full rounded-full transition-all duration-700", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function AnalysisCard({ a, index }: { a: StoredPrediction; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const predictionColor =
    a.prediction === "home" ? "text-bb-blue" :
    a.prediction === "away" ? "text-bb-red" : "text-bb-gold";
  const predictionLabel =
    a.prediction === "home" ? a.homeTeam :
    a.prediction === "away" ? a.awayTeam : "Draw";

  return (
    <div
      className="panel panel-hover rounded-xl overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="p-5 border-b border-bb-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-bb-text-3 text-[10px] font-mono uppercase tracking-widest">
            Generated {format(new Date(a.generatedAt), "MMM d, HH:mm 'UTC'")}
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-bb-blue/20 text-bb-blue bg-bb-blue/5">
            AI Pick
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2.5">
            <FlagImage src={a.homeFlag} alt={a.homeTeam} className="w-9 h-6 object-cover rounded-sm flex-shrink-0" fallbackText={a.homeTeam.slice(0, 3).toUpperCase()} />
            <div>
              <p className="font-heading font-bold text-bb-text text-sm leading-tight">{a.homeTeam}</p>
              <p className="text-bb-text-3 text-[11px] font-mono">{a.homeWinPct}% win</p>
            </div>
          </div>

          <div className="text-center flex-shrink-0">
            <div className="font-display font-bold text-2xl text-bb-text tracking-wide">{a.scoreline}</div>
            <p className={cn("text-[10px] font-mono font-bold uppercase tracking-widest mt-0.5", predictionColor)}>
              {predictionLabel}
            </p>
          </div>

          <div className="flex-1 flex items-center gap-2.5 justify-end text-right">
            <div>
              <p className="font-heading font-bold text-bb-text text-sm leading-tight">{a.awayTeam}</p>
              <p className="text-bb-text-3 text-[11px] font-mono">{a.awayWinPct}% win</p>
            </div>
            <FlagImage src={a.awayFlag} alt={a.awayTeam} className="w-9 h-6 object-cover rounded-sm flex-shrink-0" fallbackText={a.awayTeam.slice(0, 3).toUpperCase()} />
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-mono text-bb-text-3">
            <span className="w-14 truncate">{a.homeTeam.split(" ").pop()}</span>
            <ConfidenceBar pct={a.homeWinPct} color="bg-bb-blue" />
            <span className="w-6 text-right text-bb-blue font-semibold">{a.homeWinPct}%</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-bb-text-3">
            <span className="w-14">Draw</span>
            <ConfidenceBar pct={a.drawPct} color="bg-bb-gold" />
            <span className="w-6 text-right text-bb-gold font-semibold">{a.drawPct}%</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-bb-text-3">
            <span className="w-14 truncate">{a.awayTeam.split(" ").pop()}</span>
            <ConfidenceBar pct={a.awayWinPct} color="bg-bb-red" />
            <span className="w-6 text-right text-bb-red font-semibold">{a.awayWinPct}%</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-bb-navy/50 transition-colors text-left"
      >
        <span className="text-bb-text-3 text-xs font-mono uppercase tracking-widest">AI Analysis</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-bb-text-3">
            Confidence: <span className="text-bb-text font-semibold">{a.confidence}%</span>
          </span>
          {expanded ? <ChevronUp size={13} className="text-bb-text-3" /> : <ChevronDown size={13} className="text-bb-text-3" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-bb-border">
          <p className="text-bb-text-2 text-sm leading-relaxed pt-4">{a.summary}</p>
          <div>
            <p className="text-bb-text-3 text-[10px] font-mono uppercase tracking-widest mb-2">Key Factors</p>
            <ul className="space-y-1.5">
              {a.keyFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-bb-text-2">
                  <span className="text-bb-blue mt-0.5 flex-shrink-0">›</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function GenerateCard({ match, onGenerated }: { match: Match; onGenerated: (p: StoredPrediction) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/predictions/${match.id}`);
      if (!res.ok) throw new Error();
      const prediction: StoredPrediction = await res.json();
      onGenerated(prediction);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel rounded-xl p-6 flex flex-col items-center gap-4 text-center border-dashed">
      <div className="flex items-center gap-3">
        <FlagImage src={match.homeTeam.flag} alt={match.homeTeam.code} className="w-10 h-7 object-cover rounded-sm" fallbackText={match.homeTeam.code} />
        <div>
          <p className="font-heading font-bold text-bb-text text-sm">{match.homeTeam.name}</p>
        </div>
        <span className="text-bb-text-3 text-xs font-mono px-2">vs</span>
        <div>
          <p className="font-heading font-bold text-bb-text text-sm">{match.awayTeam.name}</p>
        </div>
        <FlagImage src={match.awayTeam.flag} alt={match.awayTeam.code} className="w-10 h-7 object-cover rounded-sm" fallbackText={match.awayTeam.code} />
      </div>
      <p className="text-bb-text-3 text-xs font-mono">No prediction stored for this match yet.</p>
      {error && <p className="text-bb-red text-xs font-mono">Generation failed — try again.</p>}
      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-[35px] bg-bb-blue text-white text-sm font-heading font-bold uppercase tracking-wide hover:bg-bb-blue/90 transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
        {loading ? "Generating…" : "Generate AI Prediction"}
      </button>
    </div>
  );
}

export default function AnalyticsPage() {
  // ── Tech update: hide behind coming-soon wall ─────────────────────────────
  return <ComingSoonGate />;

  // eslint-disable-next-line no-unreachable
  const [predictions, setPredictions] = useState<StoredPrediction[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/predictions").then(r => r.json()),
      fetch("/api/matches").then(r => r.json()),
    ])
      .then(([pred, matchData]) => {
        setPredictions(Array.isArray(pred) ? pred : []);
        const m = Array.isArray(matchData) ? matchData : (matchData.matches ?? []);
        setMatches(m);
      })
      .catch(() => setError("Could not load predictions from database."))
      .finally(() => setLoading(false));
  }, []);

  const storedIds = useMemo(() => new Set(predictions.map(p => p.matchId)), [predictions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return predictions;
    return predictions.filter(p =>
      p.homeTeam.toLowerCase().includes(q) ||
      p.awayTeam.toLowerCase().includes(q)
    );
  }, [predictions, query]);

  // Matches that match the search but have no stored prediction
  const unmatchedMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || filtered.length > 0) return [];
    return matches.filter(m => {
      if (storedIds.has(m.id)) return false;
      return (
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.homeTeam.shortName.toLowerCase().includes(q) ||
        m.homeTeam.code.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.shortName.toLowerCase().includes(q) ||
        m.awayTeam.code.toLowerCase().includes(q)
      );
    });
  }, [query, filtered, matches, storedIds]);

  const handleGenerated = (prediction: StoredPrediction) => {
    setPredictions(prev => [prediction, ...prev]);
  };

  const avgConfidence = predictions.length
    ? Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length)
    : 0;

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain size={20} className="text-bb-blue" />
                <p className="text-bb-blue font-mono text-xs uppercase tracking-[0.3em]">AI-Powered Fixture Analysis</p>
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-bb-text mb-1">
                AI <span className="text-bb-blue">ANALYTICS</span>
              </h1>
              <p className="text-bb-text-2 text-sm font-mono">
                World Cup 2026 fixtures analyzed using ELO ratings, form, and tactical context.
              </p>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl border border-bb-gold/30 bg-bb-gold/5 flex gap-3">
            <AlertTriangle size={16} className="text-bb-gold flex-shrink-0 mt-0.5" />
            <p className="text-bb-text-2 text-xs leading-relaxed font-mono">
              <span className="text-bb-gold font-bold uppercase tracking-wide">Disclaimer · </span>
              All predictions are generated by Google Gemini AI using publicly available statistics.{" "}
              <span className="text-bb-text font-semibold">For informational purposes only — not financial or betting advice.</span>{" "}
              Engage responsibly.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Predictions Stored", value: loading ? "—" : predictions.length.toString(), icon: TrendingUp, color: "text-bb-blue" },
            { label: "Avg Confidence",     value: loading || !predictions.length ? "—" : `${avgConfidence}%`, icon: Brain, color: "text-bb-teal" },
            { label: "Prediction Engine",  value: "AI", icon: Zap, color: "text-bb-gold" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="panel p-4 flex items-center gap-3">
              <Icon size={16} className={`${color} opacity-80 flex-shrink-0`} />
              <div className="min-w-0">
                <p className={`font-display font-bold text-xl ${color}`}>{value}</p>
                <p className="text-bb-text-3 text-[10px] font-mono truncate">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-bb-border focus-within:border-bb-blue/50 focus-within:shadow-[0_0_0_3px_rgba(0,82,255,0.08)] transition-all">
            <Search size={15} className="text-bb-text-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search predictions by team name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 text-sm font-mono text-bb-text bg-transparent outline-none placeholder:text-bb-text-3"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-bb-text-3 hover:text-bb-text transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          {query && !loading && filtered.length > 0 && (
            <p className="text-bb-text-3 text-xs font-mono mt-2 px-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
            </p>
          )}
        </div>

        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-bb-blue border-t-transparent animate-spin" />
            <div className="text-center">
              <p className="text-bb-text font-heading font-semibold">Loading predictions…</p>
              <p className="text-bb-text-3 text-xs font-mono mt-1">Fetching stored AI analysis from database</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="panel border-bb-red/20 bg-bb-red/5 p-8 text-center rounded-xl">
            <AlertTriangle size={32} className="text-bb-red/60 mx-auto mb-3" />
            <p className="text-bb-text font-heading font-semibold mb-1">{error}</p>
          </div>
        )}

        {!loading && !error && predictions.length === 0 && !query && (
          <div className="panel p-12 text-center rounded-xl">
            <Brain size={40} className="text-bb-blue/30 mx-auto mb-3" />
            <p className="text-bb-text font-heading font-bold text-lg mb-1">No predictions stored yet</p>
            <p className="text-bb-text-3 text-sm font-mono">Run the generation script to populate AI predictions.</p>
          </div>
        )}

        {/* Stored predictions grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((p, i) => (
              <AnalysisCard key={p.matchId} a={p} index={i} />
            ))}
          </div>
        )}

        {/* No stored result — show live-generate cards for matched fixtures */}
        {!loading && !error && query && filtered.length === 0 && unmatchedMatches.length > 0 && (
          <div className="space-y-4">
            <p className="text-bb-text-3 text-xs font-mono px-1">No stored prediction — generate one now:</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {unmatchedMatches.map(m => (
                <GenerateCard key={m.id} match={m} onGenerated={handleGenerated} />
              ))}
            </div>
          </div>
        )}

        {/* Truly no results */}
        {!loading && !error && query && filtered.length === 0 && unmatchedMatches.length === 0 && (
          <div className="panel p-12 text-center rounded-xl">
            <Search size={32} className="text-bb-text-3/40 mx-auto mb-3" />
            <p className="text-bb-text font-heading font-bold text-lg mb-1">No results for "{query}"</p>
            <p className="text-bb-text-3 text-sm font-mono">Try a different team name.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
