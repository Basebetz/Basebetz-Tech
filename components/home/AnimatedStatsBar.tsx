"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { TrendingUp, Activity, Users, Zap, ArrowUpRight, type LucideIcon } from "lucide-react";

interface StatConfig {
  label: string;
  rawValue: number;
  displayFn: (v: number) => string;
  sub: string;
  subUp: boolean | null;
  icon: LucideIcon;
  colorCls: string;
  borderCls: string;
  badge: string | null;
}

const STATS: StatConfig[] = [
  {
    label:     "Total Volume",
    rawValue:  382,
    displayFn: v => `$${(v / 100).toFixed(2)}M`,
    sub:       "+18% 24h",
    subUp:     true,
    icon:      TrendingUp,
    colorCls:  "text-bb-gold",
    borderCls: "stat-gold",
    badge:     null,
  },
  {
    label:     "Active Markets",
    rawValue:  48,
    displayFn: v => String(Math.round(v)),
    sub:       "12 live now",
    subUp:     true,
    icon:      Zap,
    colorCls:  "text-bb-green",
    borderCls: "stat-green",
    badge:     "LIVE",
  },
  {
    label:     "Active Traders",
    rawValue:  2841,
    displayFn: v => Math.round(v).toLocaleString(),
    sub:       "+142 today",
    subUp:     true,
    icon:      Users,
    colorCls:  "text-bb-blue",
    borderCls: "stat-blue",
    badge:     null,
  },
  {
    label:     "Settled Markets",
    rawValue:  12,
    displayFn: v => String(Math.round(v)),
    sub:       "100% accurate",
    subUp:     null,
    icon:      Activity,
    colorCls:  "text-bb-teal",
    borderCls: "stat-teal",
    badge:     null,
  },
];

function StatCard({ stat, index }: { stat: StatConfig; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const [displayValue, setDisplayValue] = useState(stat.displayFn(0));
  const { label, sub, subUp, icon: Icon, colorCls, borderCls, badge, rawValue, displayFn } = stat;

  useEffect(() => {
    if (!isInView) return;
    const proxy = { val: 0 };
    const tween = gsap.to(proxy, {
      val: rawValue,
      duration: 1.8,
      delay: index * 0.12,
      ease: "power2.out",
      onUpdate: () => setDisplayValue(displayFn(proxy.val)),
    });
    return () => { tween.kill(); };
  }, [isInView, rawValue, displayFn, index]);

  return (
    <motion.div
      ref={cardRef}
      className={`${borderCls} relative flex flex-col gap-2 group cursor-default overflow-hidden rounded-xl p-5`}
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0,82,255,0.12)",
        boxShadow: "0 2px 16px rgba(0,82,255,0.04)",
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.48, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -5,
        boxShadow: "0 16px 44px rgba(0,82,255,0.1), 0 4px 12px rgba(0,0,0,0.06)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
    >
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between">
        <motion.div
          className={`${colorCls} opacity-65 group-hover:opacity-100`}
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
        >
          <Icon size={16} />
        </motion.div>
        {badge && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-bb-green/30 bg-bb-green/8 text-bb-green font-mono text-[9px] font-bold uppercase tracking-widest broadcast-glow">
            <span className="w-1 h-1 rounded-full bg-bb-green" />
            {badge}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className={`font-display font-bold text-3xl leading-none ${colorCls} tabular-nums`}>
          {displayValue}
        </p>
        <p className="text-bb-text-3 text-[11px] font-mono uppercase tracking-wider mt-1.5">
          {label}
        </p>
      </div>

      {/* Sub-label */}
      <div className={`flex items-center gap-1 font-mono text-[11px] ${subUp === true ? "text-bb-green" : subUp === false ? "text-bb-red" : "text-bb-text-3"}`}>
        {subUp === true && <ArrowUpRight size={11} />}
        <span>{sub}</span>
      </div>

      {/* Hover glow shimmer at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, currentColor, transparent)` }}
      />
    </motion.div>
  );
}

export default function AnimatedStatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
      {STATS.map((stat, i) => (
        <StatCard key={stat.label} stat={stat} index={i} />
      ))}
    </div>
  );
}
