import type { Metadata } from "next";
import "./globals.css";
import MobileNav from "@/components/layout/MobileNav";
import Web3Provider from "@/components/providers/Web3Provider";

export const metadata: Metadata = {
  title: "BASEBETZ — Football Prediction Markets on Base",
  description: "Trade FIFA match outcomes with transparent pricing and onchain settlement on Base.",
  keywords: ["prediction market", "football", "FIFA", "Base", "crypto", "USDC"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "BASEBETZ",
    description: "Base-native football prediction markets for FIFA 2026.",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="terminal-bg min-h-screen pb-20 md:pb-0">
        <Web3Provider>
          {children}
          <MobileNav />
        </Web3Provider>
      </body>
    </html>
  );
}
