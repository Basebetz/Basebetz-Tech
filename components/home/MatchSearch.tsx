"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X, Clock, Zap } from "lucide-react";
import type { Match } from "@/lib/types";
import { formatKickoff } from "@/lib/utils";
import FlagImage from "@/components/ui/FlagImage";

interface Props {
  matches: Match[];
}

export default function MatchSearch({ matches }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusBadge = (status: Match["status"]) => {
    if (status === "live") return <span className="text-[10px] font-mono text-bb-green font-bold">LIVE</span>;
    if (status === "finished") return <span className="text-[10px] font-mono text-bb-text-3">FT</span>;
    return null;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto mb-10">
      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-bb-border bg-white shadow-card focus-within:border-bb-blue/40 focus-within:shadow-glow-sm transition-all">
        <Search size={16} className="text-bb-text-3 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search fixtures — team name, country, or group..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="flex-1 text-sm font-mono text-bb-text bg-transparent outline-none placeholder:text-bb-text-3"
        />
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="text-bb-text-3 hover:text-bb-text transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-bb-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
          {results.map(m => (
            <Link
              key={m.id}
              href={`/match/${m.id}`}
              onClick={() => { setOpen(false); setQuery(""); }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-bb-navy border-b border-bb-border last:border-0 transition-colors"
            >
              <FlagImage src={m.homeTeam.flag} alt={m.homeTeam.code} className="w-8 h-5 object-cover rounded-sm flex-shrink-0" fallbackText={m.homeTeam.code} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-bb-text">{m.homeTeam.shortName}</span>
                  <span className="text-bb-text-3 text-xs font-mono">vs</span>
                  <span className="font-heading font-bold text-sm text-bb-text">{m.awayTeam.shortName}</span>
                  {statusBadge(m.status)}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-bb-text-3 mt-0.5">
                  <span>Group {m.group}</span>
                  <span>·</span>
                  {m.status === "scheduled" && (
                    <span className="flex items-center gap-1"><Clock size={9} />{formatKickoff(m.kickoff)}</span>
                  )}
                  {(m.status === "finished" || m.status === "live") && (
                    <span className="flex items-center gap-1"><Zap size={9} />{m.homeScore ?? 0} – {m.awayScore ?? 0}</span>
                  )}
                </div>
              </div>
              <FlagImage src={m.awayTeam.flag} alt={m.awayTeam.code} className="w-8 h-5 object-cover rounded-sm flex-shrink-0" fallbackText={m.awayTeam.code} />
            </Link>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-bb-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 px-4 py-6 text-center">
          <p className="text-bb-text-3 text-sm font-mono">No fixtures match "{query}"</p>
        </div>
      )}
    </div>
  );
}
