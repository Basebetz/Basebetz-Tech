"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Briefcase, Trophy, Plus, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const LEFT_LINKS = [
  { href: "/portfolio",   label: "Portfolio", icon: Briefcase },
  { href: "/leaderboard", label: "Leaders",   icon: Trophy },
];

const RIGHT_LINKS = [
  { href: "/markets/create", label: "Create", icon: Plus },
  { href: "/analytics",      label: "AI",     icon: Brain },
];

export default function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const tabClass = (href: string) =>
    cn(
      "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors",
      isActive(href) ? "text-bb-blue" : "text-white/40"
    );

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-end"
      style={{
        background: "#090F1E",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)",
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "6px",
      }}
    >
      <div className="flex items-end w-full">

        {/* Left tabs */}
        {LEFT_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={tabClass(href)}>
            <Icon size={18} strokeWidth={isActive(href) ? 2.5 : 1.6} />
            <span className="text-[9px] font-mono uppercase tracking-wider leading-none">{label}</span>
            {isActive(href) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-bb-blue" />
            )}
          </Link>
        ))}

        {/* Center Markets — circle FAB lifted above bar */}
        <div className="flex flex-col items-center justify-end flex-shrink-0 w-20 pb-1">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center justify-center w-14 h-14 rounded-full -mt-16 transition-all shadow-lg",
              isActive("/")
                ? "bg-bb-blue shadow-[0_0_24px_rgba(0,82,255,0.55)]"
                : "bg-[#1a2540] border border-bb-blue/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            )}
          >
            <TrendingUp size={20} className={isActive("/") ? "text-white" : "text-bb-blue"} strokeWidth={2} />
            <span className={cn(
              "text-[8px] font-mono font-bold uppercase tracking-wider leading-none mt-0.5",
              isActive("/") ? "text-white" : "text-bb-blue/80"
            )}>
              Mkts
            </span>
          </Link>
        </div>

        {/* Right tabs */}
        {RIGHT_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={tabClass(href)}>
            <Icon size={18} strokeWidth={isActive(href) ? 2.5 : 1.6} />
            <span className="text-[9px] font-mono uppercase tracking-wider leading-none">{label}</span>
            {isActive(href) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-bb-blue" />
            )}
          </Link>
        ))}

      </div>
    </nav>
  );
}
