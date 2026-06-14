"use client";
import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi";
import { injected } from "wagmi/connectors";
import { formatUnits } from "viem";
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink, Smartphone, X } from "lucide-react";
import { formatAddress, cn } from "@/lib/utils";
import { ERC20_ABI } from "@/lib/contracts/abis";
import { ADDRESSES, USDC_DECIMALS } from "@/lib/contracts/addresses";

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isMetaMaskBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { ethereum?: { isMetaMask?: boolean } }).ethereum?.isMetaMask && isMobile();
}

function hasInjectedWallet(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as Window & { ethereum?: unknown }).ethereum;
}

function openInMetaMask() {
  const url = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}${window.location.search}`;
  window.location.href = url;
}

function NoWalletModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-[#0a0e1a] border border-bb-border rounded-xl p-6 w-80 shadow-card" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-bb-text-3 hover:text-bb-text">
          <X size={16} />
        </button>
        <Wallet size={28} className="text-bb-blue mb-3" />
        <h3 className="text-bb-text font-heading font-bold text-base mb-1">No wallet detected</h3>
        <p className="text-bb-text-3 text-sm mb-4">
          You need a browser wallet extension to bet on BASEBETZ. Install one below and refresh the page.
        </p>
        <div className="space-y-2">
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 bg-bb-navy border border-bb-border hover:border-bb-blue/40 rounded-lg text-bb-text text-sm transition-colors"
          >
            <img src="/metamask.svg" alt="MetaMask" className="w-6 h-6" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span>Install MetaMask</span>
            <ExternalLink size={13} className="ml-auto text-bb-text-3" />
          </a>
          <a
            href="https://www.coinbase.com/wallet/downloads"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3 bg-bb-navy border border-bb-border hover:border-bb-blue/40 rounded-lg text-bb-text text-sm transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">C</span>
            <span>Install Coinbase Wallet</span>
            <ExternalLink size={13} className="ml-auto text-bb-text-3" />
          </a>
        </div>
        <p className="text-bb-text-3 text-[10px] mt-3 text-center">
          After installing, refresh this page and click Connect Wallet.
        </p>
      </div>
    </div>
  );
}

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNoWallet, setShowNoWallet] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: usdcBalance } = useReadContract({
    abi: ERC20_ABI,
    address: ADDRESSES.USDC,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
  });

  const formattedBalance = usdcBalance !== undefined
    ? parseFloat(formatUnits(usdcBalance, USDC_DECIMALS)).toLocaleString("en-US", { maximumFractionDigits: 2 })
    : "—";

  // Auto-connect when inside MetaMask mobile browser
  useEffect(() => {
    if (isMetaMaskBrowser() && !isConnected && !isPending) {
      connect({ connector: injected() });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleConnect = () => {
    const mobile = isMobile();

    // Mobile without MetaMask browser → deep-link
    if (mobile && !isMetaMaskBrowser()) {
      openInMetaMask();
      return;
    }

    // Desktop or MetaMask mobile browser — check for injected wallet first
    if (!hasInjectedWallet()) {
      setShowNoWallet(true);
      return;
    }

    connect({ connector: injected() });
  };

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isConnected) {
    const mobile = isMobile();
    return (
      <>
        {showNoWallet && <NoWalletModal onClose={() => setShowNoWallet(false)} />}
        <button
          onClick={handleConnect}
          disabled={isPending}
          className="flex items-center gap-2 bg-bb-blue hover:bg-bb-blue-2 disabled:opacity-60 text-white font-heading font-semibold text-sm px-4 py-2 rounded-[35px] transition-all shadow-glow-sm uppercase tracking-wide"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Connecting…
            </>
          ) : mobile ? (
            <>
              <Smartphone size={15} />
              Open MetaMask
            </>
          ) : (
            <>
              <Wallet size={15} />
              Connect Wallet
            </>
          )}
        </button>
        {connectError && (
          <p className="text-bb-red text-xs mt-1">{connectError.message.slice(0, 80)}</p>
        )}
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-bb-navy border border-bb-border hover:border-bb-blue/40 text-bb-text text-sm px-3 py-2 rounded-[35px] transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-bb-blue shadow-glow-sm" />
        <span className="font-mono text-xs text-bb-text-2">{formatAddress(address!)}</span>
        <span className="font-mono text-xs text-bb-green">{formattedBalance} USDC</span>
        <ChevronDown size={13} className={cn("text-bb-text-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 panel border border-bb-blue/20 rounded-lg z-50 shadow-card overflow-hidden">
          <div className="p-4 border-b border-bb-border">
            <p className="text-bb-text-3 text-[10px] uppercase font-mono mb-1">Base Mainnet</p>
            <p className="text-bb-text font-mono text-sm">{formatAddress(address!)}</p>
            <p className="text-bb-green font-mono text-lg font-bold mt-1">{formattedBalance} USDC</p>
          </div>
          <div className="p-2">
            <button onClick={copy}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bb-navy rounded text-bb-text-2 hover:text-bb-text text-sm transition-colors">
              <Copy size={14} /> {copied ? "Copied!" : "Copy Address"}
            </button>
            <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bb-navy rounded text-bb-text-2 hover:text-bb-text text-sm transition-colors">
              <ExternalLink size={14} /> View on Basescan
            </a>
            <button onClick={() => { disconnect(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bb-red/8 rounded text-bb-text-2 hover:text-bb-red text-sm transition-colors">
              <LogOut size={14} /> Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
