"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import type { Match } from "@/lib/types";

const MARKET_TYPES = [
  { value: "match_winner",     label: "Match Winner",      desc: "Home / Draw / Away outcome" },
  { value: "both_teams_score", label: "Both Teams Score",  desc: "Yes / No" },
  { value: "total_goals",      label: "Total Goals",       desc: "Over / Under a threshold" },
  { value: "qualification",    label: "Team Qualification",desc: "Will team X advance?" },
];

export default function CreateMarketPage() {
  const [step, setStep] = useState(1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [formData, setFormData] = useState({
    matchId: "",
    marketType: "",
    question: "",
    threshold: "",
    closingTime: "kickoff",
    agreeTerms: false,
    confirmAge: false,
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/matches?status=scheduled")
      .then(r => r.json())
      .then(d => setMatches(d.matches ?? []))
      .catch(() => {});
  }, []);

  const selectedMatch = matches.find(m => m.id === formData.matchId);

  const handleSubmit = async () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="panel border-bb-green/25 bg-bb-green/5 p-12 rounded-xl text-center max-w-md shadow-card">
            <CheckCircle size={48} className="text-bb-green mx-auto mb-4" />
            <h2 className="font-display font-bold text-3xl text-bb-text mb-2">Market Submitted!</h2>
            <p className="text-bb-text-2 text-sm mb-6">Your market request is under review. Approved markets go live within 2 hours of submission.</p>
            <Link href="/"><Button variant="primary">Back to Markets</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[800px] mx-auto w-full px-4 sm:px-6 py-8">

        <Link href="/" className="inline-flex items-center gap-2 text-bb-text-3 hover:text-bb-blue text-sm font-mono mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Markets
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-4xl text-bb-text mb-2">Create Market</h1>
          <p className="text-bb-text-2 text-sm">Request a new prediction market for an upcoming FIFA fixture.</p>
        </div>

        {/* Compliance warning */}
        <div className="panel border-bb-gold/25 bg-bb-gold/5 p-4 flex gap-3 mb-8 rounded-lg">
          <Shield size={18} className="text-bb-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-bb-gold font-heading font-semibold text-sm uppercase tracking-wide mb-1">Compliance Notice</p>
            <p className="text-bb-text-2 text-xs leading-relaxed">
              All markets require objective, verifiable settlement criteria. Only FIFA-approved data sources will be used.
              Markets in restricted jurisdictions will be blocked. By creating a market you agree to the BASEBETZ Market Rules.
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm transition-all
                ${step === s ? "bg-bb-blue text-white shadow-glow-sm" :
                  step > s ? "bg-bb-green/15 text-bb-green border border-bb-green/30" :
                  "bg-bb-navy border border-bb-border text-bb-text-3"}`}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div className={`h-px w-12 ${step > s ? "bg-bb-blue/30" : "bg-bb-border"}`} />}
            </div>
          ))}
          <span className="text-bb-text-3 text-xs font-mono ml-2">
            {step === 1 ? "Select Fixture" : step === 2 ? "Market Details" : "Review & Submit"}
          </span>
        </div>

        {/* Step 1: Select fixture */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-xl text-bb-text">Select a Fixture</h2>
            <div className="grid gap-3">
              {matches.length === 0 && (
                <p className="text-bb-text-3 text-xs font-mono text-center py-6">Loading fixtures…</p>
              )}
              {matches.map(match => (
                <button
                  key={match.id}
                  onClick={() => { setFormData(d => ({ ...d, matchId: match.id })); }}
                  className={`panel panel-hover p-4 text-left transition-all ${
                    formData.matchId === match.id ? "border-bb-blue/40 bg-bb-blue/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bb-navy border border-bb-border flex items-center justify-center text-lg">
                        {match.homeTeam.flag}
                      </div>
                      <span className="font-heading font-bold text-bb-text">{match.homeTeam.name}</span>
                      <span className="text-bb-text-3 font-mono">vs</span>
                      <span className="font-heading font-bold text-bb-text">{match.awayTeam.name}</span>
                      <div className="w-8 h-8 rounded-full bg-bb-navy border border-bb-border flex items-center justify-center text-lg">
                        {match.awayTeam.flag}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-bb-text-3 text-xs font-mono">Group {match.group}</p>
                      <p className="text-bb-blue text-xs font-mono">{match.city}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              size="lg"
              disabled={!formData.matchId}
              onClick={() => setStep(2)}
            >
              Next: Market Details
            </Button>
          </div>
        )}

        {/* Step 2: Market details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-bb-text">Market Details</h2>

            {selectedMatch && (
              <div className="panel p-3 flex items-center gap-3 border-bb-blue/25 bg-bb-blue/4">
                <div className="w-8 h-8 rounded-full bg-bb-navy border border-bb-border flex items-center justify-center text-lg">
                {selectedMatch.homeTeam.flag}
              </div>
                <span className="text-bb-text font-medium">{selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}</span>
              <div className="w-8 h-8 rounded-full bg-bb-navy border border-bb-border flex items-center justify-center text-lg">
                {selectedMatch.awayTeam.flag}
              </div>
                <button onClick={() => setStep(1)} className="ml-auto text-bb-text-3 hover:text-bb-blue text-xs font-mono">Change</button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-bb-text-3 text-xs font-mono uppercase tracking-widest">Market Type</label>
              <div className="grid gap-2">
                {MARKET_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData(d => ({ ...d, marketType: type.value }))}
                    className={`panel panel-hover p-3 text-left transition-all ${formData.marketType === type.value ? "border-bb-blue/40 bg-bb-blue/5" : ""}`}
                  >
                    <p className="text-bb-text font-medium text-sm">{type.label}</p>
                    <p className="text-bb-text-3 text-xs font-mono">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-bb-text-3 text-xs font-mono uppercase tracking-widest">Market Question</label>
              <input
                type="text"
                placeholder="e.g. Will France beat Netherlands?"
                value={formData.question}
                onChange={e => setFormData(d => ({ ...d, question: e.target.value }))}
                className="bb-input"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!formData.marketType || !formData.question}
                onClick={() => setStep(3)}
              >
                Next: Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-heading font-bold text-xl text-bb-text">Review & Submit</h2>

            <div className="panel p-5 space-y-3 bg-bb-navy/40">
              <div className="flex justify-between text-sm">
                <span className="text-bb-text-3 font-mono">Fixture</span>
                <span className="text-bb-text font-medium">{selectedMatch?.homeTeam.name} vs {selectedMatch?.awayTeam.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-bb-text-3 font-mono">Market Type</span>
                <span className="text-bb-text">{MARKET_TYPES.find(t => t.value === formData.marketType)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-bb-text-3 font-mono">Question</span>
                <span className="text-bb-text text-right max-w-xs">{formData.question}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-bb-text-3 font-mono">Settlement</span>
                <span className="text-bb-text">Official FIFA match result feed</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              {[
                { key: "agreeTerms",  label: "I agree to BASEBETZ Market Rules and Terms of Service" },
                { key: "confirmAge",  label: "I confirm I am of legal age in my jurisdiction" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={e => setFormData(d => ({ ...d, [key]: e.target.checked }))}
                    className="mt-0.5 accent-bb-blue"
                  />
                  <span className="text-bb-text-2 text-sm">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button
                variant="primary"
                size="lg"
                disabled={!formData.agreeTerms || !formData.confirmAge}
                onClick={handleSubmit}
              >
                Submit Market Request
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
