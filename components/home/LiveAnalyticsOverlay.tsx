"use client";

import { useEffect, useState } from "react";
import type { Match } from "@/lib/types";

interface LiveAnalyticsOverlayProps {
  match: Match;
}

interface LiveStats {
  homePoss: number;
  homeShots: number;
  awayShots: number;
  homeOnTarget: number;
  awayOnTarget: number;
  homePassAcc: number;
  awayPassAcc: number;
  homeCorners: number;
  awayCorners: number;
  homeYellow: number;
  awayYellow: number;
}

const INITIAL_STATS: LiveStats = {
  homePoss: 58,
  homeShots: 12,
  awayShots: 4,
  homeOnTarget: 5,
  awayOnTarget: 2,
  homePassAcc: 87,
  awayPassAcc: 71,
  homeCorners: 6,
  awayCorners: 2,
  homeYellow: 1,
  awayYellow: 2,
};

export default function LiveAnalyticsOverlay({ match }: LiveAnalyticsOverlayProps) {
  const [stats, setStats] = useState<LiveStats>(INITIAL_STATS);
  const [updated, setUpdated] = useState<keyof LiveStats | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const jitter = (base: number, delta: number, min: number, max: number) =>
        Math.max(min, Math.min(max, base + (Math.random() - 0.5) * delta));

      setStats(prev => {
        const newPoss = Math.round(jitter(prev.homePoss, 3, 44, 68));
        const keys: (keyof LiveStats)[] = ["homePoss", "homePassAcc", "awayPassAcc"];
        const touchedKey = keys[Math.floor(Math.random() * keys.length)];
        setUpdated(touchedKey);
        setTimeout(() => setUpdated(null), 800);
        return {
          ...prev,
          homePoss: newPoss,
          homePassAcc: Math.round(jitter(prev.homePassAcc, 2, 81, 93)),
          awayPassAcc: Math.round(jitter(prev.awayPassAcc, 2, 65, 78)),
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const awayPoss = 100 - stats.homePoss;

  return (
    <div className="mb-6 px-2">
      {/* Team labels */}
      <div className="flex justify-between text-[10px] font-mono text-white/70 mb-2 px-1">
        <span className="uppercase tracking-widest">{match.homeTeam.shortName}</span>
        <span className="text-white/40 tracking-widest">LIVE ANALYTICS</span>
        <span className="uppercase tracking-widest">{match.awayTeam.shortName}</span>
      </div>

      {/* Possession bar */}
      <div className="backdrop-blur-sm bg-black/35 border border-white/15 rounded-xl px-4 py-3 mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className={`font-display font-bold text-xl transition-all duration-500 ${updated === "homePoss" ? "text-white scale-110" : "text-bb-blue"}`}>
            {stats.homePoss}%
          </span>
          <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Possession</span>
          <span className={`font-display font-bold text-xl transition-all duration-500 ${updated === "homePoss" ? "text-white scale-110" : "text-bb-red"}`}>
            {awayPoss}%
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div
            className="bg-gradient-to-r from-bb-blue to-blue-400 rounded-l-full transition-all duration-1000 ease-in-out"
            style={{ width: `${stats.homePoss}%` }}
          />
          <div className="bg-gradient-to-l from-bb-red to-red-400 rounded-r-full flex-1 transition-all duration-1000 ease-in-out" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {
            label: "Shots",
            home: stats.homeShots,
            away: stats.awayShots,
            homeClass: "text-white",
            awayClass: "text-white",
          },
          {
            label: "On Target",
            home: stats.homeOnTarget,
            away: stats.awayOnTarget,
            homeClass: "text-bb-green",
            awayClass: "text-white/70",
          },
          {
            label: "Pass %",
            home: stats.homePassAcc,
            away: stats.awayPassAcc,
            fmt: (v: number) => `${v}%`,
            homeClass: updated === "homePassAcc" ? "text-white" : "text-bb-gold",
            awayClass: updated === "awayPassAcc" ? "text-white" : "text-white/70",
          },
          {
            label: "Corners",
            home: stats.homeCorners,
            away: stats.awayCorners,
            homeClass: "text-white",
            awayClass: "text-white",
          },
        ].map(({ label, home, away, fmt, homeClass, awayClass }) => (
          <div
            key={label}
            className="backdrop-blur-sm bg-black/30 border border-white/12 rounded-lg px-2 py-2 text-center"
          >
            <p className="text-[8px] font-mono text-white/50 uppercase tracking-widest mb-1.5">{label}</p>
            <p className="font-display font-bold text-sm leading-none">
              <span className={`transition-all duration-500 ${homeClass}`}>
                {fmt ? fmt(home) : home}
              </span>
              <span className="text-white/25 mx-1">–</span>
              <span className={`transition-all duration-500 ${awayClass}`}>
                {fmt ? fmt(away) : away}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Yellow cards + data feed ticker */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-3.5 bg-yellow-400 rounded-[2px] shadow-sm" />
            <span className="text-white/70 font-mono text-[10px]">
              {match.homeTeam.shortName} {stats.homeYellow} – {stats.awayYellow} {match.awayTeam.shortName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="live-dot !w-1.5 !h-1.5" />
          <span className="text-white/50 font-mono text-[10px] uppercase tracking-widest">Data feed</span>
        </div>
      </div>
    </div>
  );
}
