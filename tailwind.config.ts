import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bb-dark":    "#FFFFFF",
        "bb-navy":    "#F2F5FF",
        "bb-card":    "#FFFFFF",
        "bb-panel":   "#F7F9FF",
        "bb-blue":    "#0052FF",
        "bb-blue-2":  "#1A6AFF",
        "bb-blue-3":  "#2B5CE6",
        "bb-green":   "#00875A",
        "bb-red":     "#D41F45",
        "bb-gold":    "#B8920D",
        "bb-teal":    "#0097A7",
        "bb-text":    "#0D1424",
        "bb-text-2":  "#374F78",
        "bb-text-3":  "#7B8FB5",
        "bb-border":  "rgba(0,82,255,0.12)",
      },
      fontFamily: {
        display:  ["var(--font-rajdhani)", "sans-serif"],
        heading:  ["var(--font-barlow)", "sans-serif"],
        body:     ["var(--font-inter)", "sans-serif"],
        mono:     ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, rgba(0,82,255,0.05) 1px, transparent 1px)",
        "glow-blue":    "radial-gradient(ellipse at center, rgba(0,82,255,0.08) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid": "32px 32px",
      },
      boxShadow: {
        "glow-blue":  "0 0 20px rgba(0,82,255,0.15), 0 0 60px rgba(0,82,255,0.05)",
        "glow-sm":    "0 0 10px rgba(0,82,255,0.2)",
        "glow-green": "0 0 12px rgba(0,135,90,0.25)",
        "glow-red":   "0 0 12px rgba(212,31,69,0.2)",
        "card":       "0 1px 0 rgba(0,82,255,0.06), 0 4px 12px rgba(0,0,0,0.06)",
      },
      animation: {
        "pulse-dot":   "pulseDot 2s ease-in-out infinite",
        "ticker":      "ticker 40s linear infinite",
        "fade-up":     "fadeUp 0.4s ease-out",
        "glow-pulse":  "glowPulse 3s ease-in-out infinite",
        "scan-line":   "scanLine 4s linear infinite",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.4", transform: "scale(0.8)" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 16px rgba(0,82,255,0.12)" },
          "50%":      { boxShadow: "0 0 32px rgba(0,82,255,0.28)" },
        },
        scanLine: {
          "0%":   { top: "0%" },
          "100%": { top: "100%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
