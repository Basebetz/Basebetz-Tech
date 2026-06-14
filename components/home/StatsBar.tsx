import { TrendingUp, Activity, Users, Zap, ArrowUpRight } from "lucide-react";

const STATS = [
  {
    label:     "Total Volume",
    value:     "$3.82M",
    sub:       "+18% 24h",
    subUp:     true,
    icon:      TrendingUp,
    colorCls:  "text-bb-gold",
    borderCls: "stat-gold",
    badge:     null,
  },
  {
    label:     "Active Markets",
    value:     "48",
    sub:       "12 live now",
    subUp:     true,
    icon:      Zap,
    colorCls:  "text-bb-green",
    borderCls: "stat-green",
    badge:     "LIVE",
  },
  {
    label:     "Active Traders",
    value:     "2,841",
    sub:       "+142 today",
    subUp:     true,
    icon:      Users,
    colorCls:  "text-bb-blue",
    borderCls: "stat-blue",
    badge:     null,
  },
  {
    label:     "Settled Markets",
    value:     "12",
    sub:       "100% accurate",
    subUp:     null,
    icon:      Activity,
    colorCls:  "text-bb-teal",
    borderCls: "stat-teal",
    badge:     null,
  },
];

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
      {STATS.map(({ label, value, sub, subUp, icon: Icon, colorCls, borderCls, badge }) => (
        <div
          key={label}
          className={`panel panel-hover p-5 ${borderCls} flex flex-col gap-2 group`}
        >
          <div className="flex items-start justify-between">
            <div className={`${colorCls} opacity-70 group-hover:opacity-100 transition-opacity`}>
              <Icon size={16} />
            </div>
            {badge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-bb-green/30 bg-bb-green/8 text-bb-green font-mono text-[9px] font-bold uppercase tracking-widest broadcast-glow">
                <span className="w-1 h-1 rounded-full bg-bb-green" />
                {badge}
              </span>
            )}
          </div>

          <div>
            <p className={`font-display font-bold text-3xl leading-none ${colorCls}`}>
              {value}
            </p>
            <p className="text-bb-text-3 text-[11px] font-mono uppercase tracking-wider mt-1.5">
              {label}
            </p>
          </div>

          <div className={`flex items-center gap-1 font-mono text-[11px] ${subUp === true ? "text-bb-green" : subUp === false ? "text-bb-red" : "text-bb-text-3"}`}>
            {subUp === true && <ArrowUpRight size={11} />}
            <span>{sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
