import { AlertCircle, TrendingUp, Users, Cloud, BarChart2 } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, React.ElementType> = {
  injury:  AlertCircle,
  lineup:  Users,
  form:    TrendingUp,
  weather: Cloud,
  expert:  BarChart2,
  market:  TrendingUp,
};

interface IntelCardProps {
  items: NewsItem[];
}

export default function IntelCard({ items }: IntelCardProps) {
  return (
    <div className="panel p-5">
      <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm mb-4">
        Match Intelligence
      </h3>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = TYPE_ICONS[item.type] ?? TrendingUp;
          return (
            <div key={item.id} className={cn(
              "p-3 rounded-lg border",
              item.impact === "positive" ? "border-bb-green/20 bg-bb-green/5" :
              item.impact === "negative" ? "border-bb-red/20 bg-bb-red/5" :
              "border-bb-border bg-bb-navy/60"
            )}>
              <div className="flex items-start gap-2">
                <Icon size={14} className={cn(
                  "mt-0.5 flex-shrink-0",
                  item.impact === "positive" ? "text-bb-green" :
                  item.impact === "negative" ? "text-bb-red" :
                  "text-bb-blue"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-bb-text text-xs font-semibold leading-snug">{item.headline}</p>
                    {item.priceImpact !== undefined && item.priceImpact !== 0 && (
                      <span className={cn(
                        "text-[10px] font-mono font-bold flex-shrink-0",
                        item.priceImpact > 0 ? "text-bb-green" : "text-bb-red"
                      )}>
                        {item.priceImpact > 0 ? "+" : ""}{(item.priceImpact * 100).toFixed(0)}pp
                      </span>
                    )}
                  </div>
                  <p className="text-bb-text-2 text-xs leading-relaxed">{item.summary}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-bb-text-3 text-[10px] font-mono">{item.source}</span>
                    <span className="text-bb-text-3 text-[10px] font-mono">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
