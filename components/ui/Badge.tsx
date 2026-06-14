import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "blue" | "green" | "red" | "gold" | "teal" | "gray" | "live" | "settled" | "open";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

export default function Badge({ variant = "blue", size = "sm", className, children }: BadgeProps) {
  const base = "inline-flex items-center gap-1 rounded font-mono font-medium uppercase tracking-wider";

  const variants: Record<string, string> = {
    blue:    "bg-bb-blue/10 text-bb-blue border border-bb-blue/20",
    green:   "bg-bb-green/10 text-bb-green border border-bb-green/20",
    red:     "bg-bb-red/10 text-bb-red border border-bb-red/20",
    gold:    "bg-bb-gold/10 text-bb-gold border border-bb-gold/20",
    teal:    "bg-bb-teal/10 text-bb-teal border border-bb-teal/20",
    gray:    "bg-bb-navy text-bb-text-2 border border-bb-border",
    live:    "bg-bb-green/10 text-bb-green border border-bb-green/25",
    settled: "bg-bb-navy text-bb-text-3 border border-bb-border",
    open:    "bg-bb-blue/10 text-bb-blue border border-bb-blue/20",
  };

  const sizes: Record<string, string> = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)}>
      {variant === "live" && <span className="w-1.5 h-1.5 rounded-full bg-bb-green animate-pulse" />}
      {children}
    </span>
  );
}
