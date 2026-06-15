"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { TrendingUp, Briefcase, Trophy, CalendarDays, Zap, Map, Search, Brain } from "lucide-react";
import WalletConnect from "@/components/ui/WalletConnect";
import SearchOverlay from "@/components/layout/SearchOverlay";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",            label: "Markets",      icon: TrendingUp },
  { href: "/portfolio",   label: "Portfolio",    icon: Briefcase },
  { href: "/leaderboard", label: "Leaderboard",  icon: Trophy },
  { href: "/tournament",  label: "Fixtures",     icon: CalendarDays },
  { href: "/roadmap",     label: "Roadmap",      icon: Map },
];

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
    {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    <header className="sticky top-0 z-50 w-full border-b border-bb-border bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div className="relative w-9 h-9 rounded-full overflow-hidden">
            <Image src="/logo.png" alt="BASEBETZ" fill className="object-contain" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-bb-text">
            BASE<span className="text-bb-blue">BETZ</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            const isRoadmap = href === "/roadmap";
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-[35px] text-sm font-heading font-semibold uppercase tracking-wide transition-all",
                  active && isRoadmap
                    ? "bg-bb-gold/10 text-bb-gold border border-bb-gold/25"
                    : active
                    ? "bg-bb-blue/10 text-bb-blue border border-bb-blue/25"
                    : isRoadmap
                    ? "text-bb-gold/80 hover:text-bb-gold hover:bg-bb-gold/8 border border-transparent hover:border-bb-gold/15"
                    : "text-bb-text-3 hover:text-bb-text hover:bg-bb-navy"
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-bb-green/25 bg-bb-green/8">
            <span className="live-dot" />
            <span className="text-bb-green text-[11px] font-mono font-medium uppercase tracking-widest">Live</span>
            <Zap size={11} className="text-bb-green" />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-bb-blue/20 bg-bb-blue/5">
            <span className="w-2 h-2 rounded-full bg-bb-blue shadow-glow-sm" />
            <span className="text-bb-blue text-[11px] font-mono font-medium">Base</span>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search fixtures"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-bb-border hover:border-bb-blue/40 hover:bg-bb-blue/5 text-bb-text-3 hover:text-bb-blue transition-all"
          >
            <Search size={16} />
          </button>

          {/* AI Analytics icon — mobile only, links to /analytics */}
          <a
            href="/analytics"
            aria-label="AI Analytics"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-bb-border hover:border-bb-teal/40 hover:bg-bb-teal/5 text-bb-text-3 hover:text-bb-teal transition-all"
          >
            <Brain size={16} />
          </a>

          <WalletConnect />
        </div>
      </div>
    </header>
    </>
  );
}
