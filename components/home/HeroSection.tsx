"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { TrendingUp, Brain } from "lucide-react";

gsap.registerPlugin();

// ── FloatingChip: mouse-parallax + float + entrance ─────────────────
interface FloatingChipProps {
  children: React.ReactNode;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  depth: number;
  className?: string;
  floatDuration?: number;
  floatAmplitude?: number;
  floatDelay?: number;
  entranceDelay?: number;
}

function FloatingChip({
  children,
  mouseX,
  mouseY,
  depth,
  className,
  floatDuration = 5.2,
  floatAmplitude = 10,
  floatDelay = 0,
  entranceDelay = 0,
}: FloatingChipProps) {
  const rawX = useTransform(mouseX, [0, 1], [-depth * 200, depth * 200]);
  const rawY = useTransform(mouseY, [0, 1], [-depth * 140, depth * 140]);
  const spx = useSpring(rawX, { stiffness: 55, damping: 18 });
  const spy = useSpring(rawY, { stiffness: 55, damping: 18 });

  return (
    <motion.div style={{ x: spx }} className={className}>
      <motion.div
        style={{ y: spy }}
        initial={{ opacity: 0, scale: 0.5, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.5, delay: entranceDelay + 0.85 },
          scale: { type: "spring", stiffness: 220, damping: 16, delay: entranceDelay + 0.85 },
          y: { type: "spring", stiffness: 220, damping: 16, delay: entranceDelay + 0.85 },
        }}
      >
        <motion.div
          animate={{ y: [0, -floatAmplitude, 0], rotate: [-0.4, 0.4, -0.4] }}
          transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────
export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };
  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl
        .from(".hero-badge", { y: -28, opacity: 0, duration: 0.6 })
        .from(".hero-word", { y: 80, opacity: 0, stagger: 0.1, duration: 0.7 }, "-=0.1")
        .from(".hero-char", { y: 90, opacity: 0, stagger: 0.06, duration: 0.6, ease: "back.out(1.6)" }, "-=0.4")
        .from(".hero-sub",  { y: 22, opacity: 0, duration: 0.5 }, "-=0.25")
        .from(".hero-ctas", { y: 20, opacity: 0, duration: 0.45 }, "-=0.3")
        .from(".hero-stats",{ y: 14, opacity: 0, duration: 0.4 }, "-=0.25");
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative mb-12 overflow-hidden rounded-2xl border border-white/10 min-h-[520px] flex items-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Full-bleed video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/pc.jpg"
      >
        <source src="/basebetzvideo.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />

      {/* Radial center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,82,255,0.12) 0%, transparent 70%)" }}
      />

      {/* Decorative center-circle rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-white/10 pointer-events-none"
        animate={{ scale: [1, 1.03, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white/15 pointer-events-none"
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* ── Floating glassmorphism odds chips (xl only) ── */}
      <FloatingChip mouseX={mouseX} mouseY={mouseY} depth={0.06} className="absolute top-9 left-10 hidden xl:block" floatDuration={5.2} floatDelay={0} entranceDelay={0}>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md bg-white/75 border border-white/60 shadow-[0_8px_32px_rgba(0,82,255,0.1)] text-sm font-mono font-bold text-bb-text whitespace-nowrap">
          🇦🇷 <span className="text-bb-blue">ARG</span> <span className="text-bb-text-3 font-normal text-xs">Win</span> <span className="text-bb-green">1.85</span>
        </div>
      </FloatingChip>

      <FloatingChip mouseX={mouseX} mouseY={mouseY} depth={0.04} className="absolute top-12 right-10 hidden xl:block" floatDuration={6.4} floatAmplitude={13} floatDelay={1} entranceDelay={0.1}>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md bg-white/75 border border-bb-gold/30 shadow-[0_8px_32px_rgba(184,146,13,0.1)] text-sm font-mono font-bold whitespace-nowrap">
          ⚽ <span className="text-bb-gold">Over 2.5</span> <span className="text-bb-green">1.90</span>
        </div>
      </FloatingChip>

      <FloatingChip mouseX={mouseX} mouseY={mouseY} depth={0.07} className="absolute bottom-16 left-10 hidden xl:block" floatDuration={5.8} floatAmplitude={9} floatDelay={1.8} entranceDelay={0.15}>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md bg-white/75 border border-bb-green/25 shadow-[0_8px_32px_rgba(0,135,90,0.1)] text-xs font-mono whitespace-nowrap">
          <TrendingUp size={12} className="text-bb-green" />
          <span className="text-bb-green font-bold">+$18,420</span>
          <span className="text-bb-text-3">won today</span>
        </div>
      </FloatingChip>

      <FloatingChip mouseX={mouseX} mouseY={mouseY} depth={0.05} className="absolute bottom-10 right-10 hidden xl:block" floatDuration={6.8} floatAmplitude={14} floatDelay={2.6} entranceDelay={0.05}>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md bg-white/75 border border-bb-red/20 shadow-[0_8px_32px_rgba(212,31,69,0.08)] text-sm font-mono font-bold text-bb-text whitespace-nowrap">
          🇧🇷 <span className="text-bb-red">BRA</span> <span className="text-bb-text-3 font-normal text-xs">Win</span> <span className="text-bb-green">2.80</span>
        </div>
      </FloatingChip>

      <FloatingChip mouseX={mouseX} mouseY={mouseY} depth={0.035} className="absolute top-1/3 right-6 hidden xl:block" floatDuration={5.5} floatAmplitude={9} floatDelay={1.2} entranceDelay={0.2}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/75 border border-bb-teal/25 shadow-[0_6px_24px_rgba(0,151,167,0.1)] text-xs font-mono whitespace-nowrap">
          <span className="text-bb-teal font-bold">BTTS Yes</span> <span className="text-bb-green font-bold">1.72</span>
        </div>
      </FloatingChip>

      <FloatingChip mouseX={mouseX} mouseY={mouseY} depth={0.055} className="absolute bottom-1/3 left-6 hidden xl:block" floatDuration={6.2} floatAmplitude={11} floatDelay={2} entranceDelay={0.12}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/75 border border-bb-border shadow-[0_6px_24px_rgba(0,0,0,0.06)] text-xs font-mono whitespace-nowrap">
          <span className="text-bb-text-2">Draw</span> <span className="text-bb-text font-bold">3.40</span>
        </div>
      </FloatingChip>

      {/* ── Main hero content ── */}
      <div className="relative z-10 w-full text-center py-20 px-6">

        {/* Badge */}
        {/* <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm border border-bb-blue/20 bg-bb-blue/5 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-bb-blue animate-pulse" />
          <span className="text-bb-blue text-xs font-mono font-semibold uppercase tracking-widest">
            FIFA World Cup 2026 · On Base
          </span>
        </div> */}

        {/* Headline — GSAP animates .hero-word and .hero-char individually */}
        <h1 className="font-display font-bold leading-none mb-7">
          <span className="block text-6xl sm:text-7xl lg:text-8xl text-white mb-1">
            {"TRADE THE".split(" ").map((word, i) => (
              <span key={i} className="overflow-hidden inline-block mr-[0.22em] last:mr-0">
                <span className="hero-word inline-block">{word}</span>
              </span>
            ))}
          </span>
          <span className="block text-6xl sm:text-7xl lg:text-8xl shimmer-word">
            GAME
          </span>
        </h1>

        <p className="hero-sub text-white/70 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Real-money prediction markets on FIFA 2026. Transparent pricing,
          verifiable settlement, built on Base.
        </p>

        {/* CTAs — GSAP animates the wrapper div; Framer Motion handles individual button hover */}
        <div className="hero-ctas flex items-center justify-center gap-4 flex-wrap mb-12">
          <Link href="/analytics">
            <motion.button
              className="btn-shimmer relative bg-bb-blue text-white font-heading font-bold uppercase tracking-wide px-10 py-4 rounded-[35px] text-base shadow-glow-sm flex items-center gap-2.5"
              whileHover={{ scale: 1.05, boxShadow: "0 0 36px rgba(0,82,255,0.45), 0 8px 24px rgba(0,82,255,0.2)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Brain size={17} />
              AI Predictions
            </motion.button>
          </Link>
          <Link href="/leaderboard">
            <motion.button
              className="btn-shimmer relative border-2 border-white/30 text-white font-heading font-bold uppercase tracking-wide px-8 py-4 rounded-[35px] text-base bg-white/10 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: "rgba(0,82,255,0.6)", color: "#fff", backgroundColor: "rgba(0,82,255,0.15)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Leaderboard
            </motion.button>
          </Link>
        </div>

      </div>
    </div>
  );
}
