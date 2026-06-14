import { Brain, Target, TrendingUp } from "lucide-react";
import type { StoredPrediction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  prediction: StoredPrediction;
}

export default function AIPrediction({ prediction }: Props) {
  const verdictLabel = prediction.prediction === "home"
    ? prediction.homeTeam
    : prediction.prediction === "away"
      ? prediction.awayTeam
      : "Draw";

  const confidenceColor = prediction.confidence >= 75 ? "text-bb-green" : prediction.confidence >= 60 ? "text-bb-gold" : "text-bb-text-2";

  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={14} className="text-bb-blue" />
        <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">AI Prediction</h3>
        <span className="ml-auto text-[10px] font-mono text-bb-text-3 border border-bb-border px-1.5 py-0.5 rounded">Gemini</span>
      </div>

      {/* Verdict */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-bb-navy border border-bb-border">
        <div>
          <p className="text-[10px] font-mono text-bb-text-3 uppercase tracking-wider mb-0.5">Verdict</p>
          <p className="font-heading font-bold text-bb-text text-base">{verdictLabel} {prediction.prediction !== "draw" ? "Win" : ""}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-bb-text-3 uppercase tracking-wider mb-0.5">Confidence</p>
          <p className={cn("font-mono font-bold text-lg", confidenceColor)}>{prediction.confidence}%</p>
        </div>
      </div>

      {/* Predicted score */}
      <div className="flex items-center gap-2 mb-4">
        <Target size={12} className="text-bb-text-3" />
        <span className="text-bb-text-3 text-xs font-mono">Predicted score:</span>
        <span className="font-mono font-bold text-bb-text text-sm">{prediction.scoreline}</span>
      </div>

      {/* Win probability bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-mono text-bb-text-3 mb-1">
          <span>{prediction.homeTeam.split(" ").slice(-1)[0]}</span>
          <span>Draw</span>
          <span>{prediction.awayTeam.split(" ").slice(-1)[0]}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          <div className="bg-bb-blue" style={{ width: `${prediction.homeWinPct}%` }} />
          <div className="bg-bb-gold/70" style={{ width: `${prediction.drawPct}%` }} />
          <div className="bg-bb-red/70" style={{ width: `${prediction.awayWinPct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-mono mt-1">
          <span className="text-bb-blue font-semibold">{prediction.homeWinPct}%</span>
          <span className="text-bb-gold font-semibold">{prediction.drawPct}%</span>
          <span className="text-bb-red font-semibold">{prediction.awayWinPct}%</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-bb-text-2 text-xs leading-relaxed mb-4">{prediction.summary}</p>

      {/* Key factors */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={11} className="text-bb-text-3" />
          <p className="text-[10px] font-mono text-bb-text-3 uppercase tracking-wider">Key Factors</p>
        </div>
        <ul className="space-y-1">
          {prediction.keyFactors.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-bb-text-2">
              <span className="text-bb-blue font-bold mt-0.5">·</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
