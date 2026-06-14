"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X, Clock, Zap, ChevronRight } from "lucide-react";
import type { Match } from "@/lib/types";
import { formatKickoff } from "@/lib/utils";
import FlagImage from "@/components/ui/FlagImage";

interface Props {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all matches once on mount
  useEffect(() => {
    fetch("/api/matches")
      .then(r => r.json())
      .then(data => {
        // route returns { matches, total } or an array
        setMatches(Array.isArray(data) ? data : (data.matches ?? []));
      })
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = query.trim().length < 2 ? [] : matches.filter(m => {
    const q = query.toLowerCase();
    return (
      m.homeTeam.name.toLowerCase().includes(q) ||
      m.homeTeam.shortName.toLowerCase().includes(q) ||
      m.homeTeam.code.toLowerCase().includes(q) ||
      m.awayTeam.name.toLowerCase().includes(q) ||
      m.awayTeam.shortName.toLowerCase().includes(q) ||
      m.awayTeam.code.toLowerCase().includes(q) ||
      `group ${m.group}`.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  const navigate = useCallback(() => onClose(), [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center pt-[10vh] px-4"
      style={{ backdropFilter: "blur(12px) brightness(0.45)" }}
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Search panel */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.4)] border border-white/60">
          <Search size={18} className="text-bb-text-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search fixtures — team, country, or group…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-base font-mono text-bb-text bg-transparent outline-none placeholder:text-bb-text-3"
          />
          {query ? (
            <button onClick={() => setQuery("")} className="text-bb-text-3 hover:text-bb-text transition-colors">
              <X size={16} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-bb-border text-bb-text-3 text-[11px] font-mono">Esc</kbd>
          )}
        </div>

        {/* Results */}
        {(results.length > 0 || (query.length >= 2 && !loading)) && (
          <div className="mt-2 bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/60 overflow-hidden">
            {results.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <p className="text-bb-text-2 text-sm font-mono">No matches found for "{query}"</p>
              </div>
            ) : (
              results.map(m => (
                <Link
                  key={m.id}
                  href={`/match/${m.id}`}
                  onClick={navigate}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-bb-navy border-b border-bb-border last:border-0 transition-colors group"
                >
                  <FlagImage
                    src={m.homeTeam.flag}
                    alt={m.homeTeam.code}
                    className="w-9 h-6 object-cover rounded-sm flex-shrink-0"
                    fallbackText={m.homeTeam.code}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-sm text-bb-text">{m.homeTeam.shortName}</span>
                      <span className="text-bb-text-3 text-xs font-mono">vs</span>
                      <span className="font-heading font-bold text-sm text-bb-text">{m.awayTeam.shortName}</span>
                      {m.status === "live" && <span className="text-[10px] font-mono text-bb-green font-bold animate-pulse">LIVE</span>}
                      {m.status === "finished" && <span className="text-[10px] font-mono text-bb-text-3">FT</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-bb-text-3 mt-0.5">
                      <span>Group {m.group}</span>
                      <span>·</span>
                      {m.status === "scheduled" && (
                        <span className="flex items-center gap-1">
                          <Clock size={9} /> {formatKickoff(m.kickoff)}
                        </span>
                      )}
                      {(m.status === "finished" || m.status === "live") && (
                        <span className="flex items-center gap-1 font-semibold text-bb-text">
                          <Zap size={9} /> {m.homeScore ?? 0} – {m.awayScore ?? 0}
                        </span>
                      )}
                    </div>
                  </div>
                  <FlagImage
                    src={m.awayTeam.flag}
                    alt={m.awayTeam.code}
                    className="w-9 h-6 object-cover rounded-sm flex-shrink-0"
                    fallbackText={m.awayTeam.code}
                  />
                  <ChevronRight size={14} className="text-bb-text-3 group-hover:text-bb-blue transition-colors flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        )}

        {loading && query.length === 0 && (
          <div className="mt-3 text-center text-white/50 text-xs font-mono">Loading fixtures…</div>
        )}

        {query.length === 0 && !loading && matches.length > 0 && (
          <p className="mt-3 text-center text-white/40 text-xs font-mono">
            {matches.length} fixtures · type to search
          </p>
        )}
      </div>
    </div>
  );
}
