import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";

export default function TournamentBanner() {
  return (
    <section className="mb-12 relative overflow-hidden rounded-2xl" style={{ minHeight: 220 }}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: "url(/show.png)",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.72) 100%)" }} />
      {/* Gold accent strip */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-bb-gold to-transparent" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-8 py-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-bb-gold" />
            <span className="text-bb-gold font-mono text-xs uppercase tracking-[0.3em] font-semibold">FIFA World Cup 2026</span>
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white leading-none mb-2" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
            WORLD CUP
            <span className="block text-bb-gold">2026</span>
          </h2>
          <p className="text-white/60 text-sm font-mono mt-2">48 teams · 12 groups · USA, Canada &amp; Mexico</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/tournament">
            <button className="flex items-center gap-2 bg-bb-gold hover:bg-yellow-500 text-black font-heading font-bold uppercase tracking-wide px-7 py-3 rounded-full transition-all shadow-lg text-sm whitespace-nowrap">
              Go to Tournament <ChevronRight size={16} />
            </button>
          </Link>
          <Link href="#upcoming">
            <button className="flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-heading font-bold uppercase tracking-wide px-7 py-3 rounded-full transition-all text-sm whitespace-nowrap">
              View Fixtures <ChevronRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
