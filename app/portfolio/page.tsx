import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WalletBalances from "@/components/portfolio/WalletBalances";
import { Briefcase } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-bb-blue/10 border border-bb-blue/20 flex items-center justify-center">
            <Briefcase size={18} className="text-bb-blue" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-bb-text">Portfolio</h1>
            <p className="text-bb-text-3 text-sm font-mono">Your wallet balances and bet history</p>
          </div>
        </div>

        <WalletBalances />
      </main>

      <Footer />
    </div>
  );
}
