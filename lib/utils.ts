import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isAfter, isBefore } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSDC(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(amount)
    .replace("$", "");
}

export function formatVolume(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

export function formatProbability(prob: number): string {
  return `${(prob * 100).toFixed(1)}%`;
}

export function formatDecimalOdds(prob: number): string {
  if (prob <= 0) return "—";
  return (1 / prob).toFixed(2);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(3)}`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatKickoff(iso: string): string {
  const date = new Date(iso);
  return format(date, "EEE d MMM · HH:mm 'UTC'");
}

export function timeUntilKickoff(iso: string): string {
  const date = new Date(iso);
  if (isAfter(new Date(), date)) return "Started";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function pnlColor(value: number): string {
  if (value > 0) return "text-bb-green";
  if (value < 0) return "text-bb-red";
  return "text-bb-text-2";
}

export function pnlSign(value: number): string {
  return value >= 0 ? "+" : "";
}

export function matchStatusLabel(status: string, minute?: number): string {
  if (status === "live" && minute) return `${minute}'`;
  if (status === "halftime") return "HT";
  if (status === "finished") return "FT";
  return "";
}

export function outcomeColor(label: string): string {
  const l = label.toLowerCase();
  if (l === "draw" || l === "x") return "text-bb-gold";
  if (l.includes("yes") || l.includes("btts") || l === "over") return "text-bb-green";
  if (l.includes("no") || l === "under") return "text-bb-red";
  return "text-bb-text";
}

export function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
