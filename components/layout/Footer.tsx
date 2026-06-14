import Link from "next/link";
import Image from "next/image";
import { Shield, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-bb-border mt-20 bg-bb-navy/50">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-7 h-7 rounded-full overflow-hidden">
                <Image src="/logo.png" alt="BASEBETZ" fill className="object-contain" />
              </div>
              <span className="font-display font-bold text-lg text-bb-text">BASE<span className="text-bb-blue">BETZ</span></span>
            </div>
            <p className="text-bb-text-3 text-xs leading-relaxed max-w-[200px]">
              Base-native football prediction markets for FIFA 2026.
            </p>
            <p className="text-bb-text-3 text-[10px] mt-3 font-mono">Base Network · USDC · EVM</p>
          </div>

          {/* Markets */}
          <div>
            <h4 className="text-bb-text-2 text-xs font-heading font-semibold uppercase tracking-widest mb-3">Markets</h4>
            {["Group Stage", "Qualification", "Tournament Winner", "Top Scorer"].map(l => (
              <Link key={l} href="/" className="block text-bb-text-3 hover:text-bb-blue text-sm mb-2 transition-colors">{l}</Link>
            ))}
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-bb-text-2 text-xs font-heading font-semibold uppercase tracking-widest mb-3">Platform</h4>
            {["Portfolio", "Leaderboard", "Create Market", "Analytics"].map(l => (
              <Link key={l} href="/" className="block text-bb-text-3 hover:text-bb-blue text-sm mb-2 transition-colors">{l}</Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-bb-text-2 text-xs font-heading font-semibold uppercase tracking-widest mb-3">Legal</h4>
            {["Terms of Service", "Privacy Policy", "Risk Disclosure", "Jurisdiction Guide"].map(l => (
              <Link key={l} href="/" className="block text-bb-text-3 hover:text-bb-blue text-sm mb-2 transition-colors">{l}</Link>
            ))}
          </div>
        </div>

        <div className="border-t border-bb-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-bb-text-3 text-xs">
            <Shield size={12} />
            <span>BASEBETZ is a prediction market platform, not a sportsbook. Always trade responsibly.</span>
          </div>
          <div className="flex items-center gap-4 text-bb-text-3 text-xs">
            <span>Built on</span>
            <a href="https://base.org" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-bb-blue hover:text-bb-blue-2 transition-colors">
              Base <ExternalLink size={10} />
            </a>
            <span className="font-mono">© 2026 BASEBETZ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
