"use client";
import type { Market } from "@/lib/types";
import { formatVolume } from "@/lib/utils";

const OUTCOME_STYLES = [
  { text: "text-bb-blue",  bar: "bg-bb-blue"  },
  { text: "text-bb-green", bar: "bg-bb-green" },
  { text: "text-bb-gold",  bar: "bg-bb-gold"  },
  { text: "text-bb-red",   bar: "bg-bb-red"   },
  { text: "text-bb-teal",  bar: "bg-bb-teal"  },
];

interface OutcomePoolProps {
  market: Market;
}

export default function OutcomePool({ market }: OutcomePoolProps) {
  const poolTotal = market.outcomes.reduce((s, o) => s + o.volume, 0);
  const hasActivity = poolTotal > 0;

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">
          Pool Breakdown
        </h3>
        <span className="text-bb-text-3 text-xs font-mono">
          {hasActivity ? formatVolume(market.totalVolume) + " total" : "no bets yet"}
        </span>
      </div>

      <div className="space-y-3">
        {market.outcomes.map((outcome, i) => {
          const style  = OUTCOME_STYLES[i % OUTCOME_STYLES.length];
          const share  = hasActivity ? outcome.volume / poolTotal : 1 / market.outcomes.length;
          const pct    = (outcome.probability * 100).toFixed(1);

          return (
            <div key={outcome.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-bb-text text-xs font-medium">{outcome.label}</span>
                <div className="flex items-center gap-2.5">
                  {hasActivity && (
                    <span className="text-bb-text-3 text-[11px] font-mono">
                      {formatVolume(outcome.volume)}
                    </span>
                  )}
                  <span className={`${style.text} text-xs font-mono font-bold`}>
                    {pct}%
                  </span>
                  <span className="text-bb-text-3 text-[11px] font-mono">
                    ${outcome.price.toFixed(3)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-bb-navy overflow-hidden">
                <div
                  className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                  style={{ width: `${(share * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-bb-border flex items-center justify-between">
        <span className="text-bb-text-3 text-[11px] font-mono uppercase tracking-wide">
          Parimutuel pool
        </span>
        <span className="text-bb-text-3 text-[11px] font-mono">
          Price = share of pool
        </span>
      </div>
    </div>
  );
}
