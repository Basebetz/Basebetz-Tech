import Link from "next/link";
import Image from "next/image";
import { Shield, ExternalLink, Github } from "lucide-react";

function TelegramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

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
            <div className="flex items-center gap-2 mt-4">
              <a
                href="https://github.com/Basebetz/Basebetz-Tech"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex items-center justify-center w-8 h-8 rounded-full border border-bb-border text-bb-text-3 hover:text-bb-text hover:border-bb-blue/40 transition-all"
              >
                <Github size={14} />
              </a>
              <a
                href="https://t.me/basebetz"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex items-center justify-center w-8 h-8 rounded-full border border-bb-border text-bb-text-3 hover:text-bb-blue hover:border-bb-blue/40 transition-all"
              >
                <TelegramIcon size={14} />
              </a>
            </div>
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
