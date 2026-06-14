import { cn, formatDecimalOdds } from "@/lib/utils";

interface OutcomeBarProps {
  outcomes: {
    id?: string;
    label: string;
    shortLabel: string;
    probability: number;
    change24h: number;
  }[];
  className?: string;
  /** Swap text colours for legibility on dark/image backgrounds */
  onDark?: boolean;
}

export default function ProbabilityBar({ outcomes, className, onDark }: OutcomeBarProps) {
  const fillClass = (idx: number) => {
    if (idx === 0) return "prob-fill-home";
    if (outcomes.length === 3 && idx === 1) return "prob-fill-draw";
    if (outcomes.length === 2 && outcomes[idx].label.toLowerCase() === "no") return "prob-fill-no";
    if (outcomes.length === 2 && idx === 0) return "prob-fill-yes";
    return "prob-fill-away";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Segmented bar */}
      <div className={cn("flex h-2 rounded-full overflow-hidden gap-px", onDark ? "bg-white/20" : "bg-bb-navy")}>
        {outcomes.map((o, i) => (
          <div
            key={o.id ?? i}
            className={cn("h-full transition-all duration-500", fillClass(i))}
            style={{ width: `${o.probability * 100}%` }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs">
        {outcomes.map((o, i) => (
          <div key={o.id ?? i} className="flex flex-col items-center gap-0.5">
            <span className={cn("font-mono text-[11px]", onDark ? "text-white/55" : "text-bb-text-3")}>{o.shortLabel}</span>
            <span className={cn("font-mono font-semibold", onDark ? "text-white" : "text-bb-text")}>{formatDecimalOdds(o.probability)}</span>
            <span className={cn("text-[10px] font-mono", o.change24h > 0 ? "text-bb-green" : o.change24h < 0 ? "text-bb-red" : onDark ? "text-white/40" : "text-bb-text-3")}>
              {o.change24h > 0 ? "+" : ""}{(o.change24h * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
