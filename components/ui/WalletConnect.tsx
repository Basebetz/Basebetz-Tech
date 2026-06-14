"use client";
import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useConnectors } from "wagmi";
import { formatUnits } from "viem";
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink, Smartphone, X, ChevronRight } from "lucide-react";
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

function openInMetaMask() {
  const url = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}${window.location.search}`;
  window.location.href = url;
}

// Friendly names for known connector IDs
function connectorLabel(name: string): string {
  if (name.toLowerCase().includes("metamask")) return "MetaMask";
  if (name.toLowerCase().includes("coinbase")) return "Coinbase Wallet";
  if (name.toLowerCase().includes("rabby")) return "Rabby";
  if (name.toLowerCase().includes("injected")) return "Browser Wallet";
  return name;
}

function WalletPickerModal({ onClose }: { onClose: () => void }) {
  const connectors = useConnectors();
  const { connect, isPending } = useConnect();
  const [connecting, setConnecting] = useState<string | null>(null);

  // Deduplicate: prefer EIP-6963 connectors over the base injected one
  const seen = new Set<string>();
  const unique = connectors.filter(c => {
    const key = c.name + c.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const handleConnect = (connector: typeof connectors[0]) => {
    setConnecting(connector.id);
    connect(
      { connector },
      {
        onSuccess: onClose,
        onError: () => setConnecting(null),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0a0e1a] border border-bb-border rounded-xl p-5 w-80 shadow-card"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-bb-text-3 hover:text-bb-text">
          <X size={16} />
        </button>

        <div className="mb-4">
          <h3 className="text-bb-text font-heading font-bold text-base">Connect Wallet</h3>
          <p className="text-bb-text-3 text-xs font-mono mt-0.5">Base Network · USDC required</p>
        </div>

        {unique.length === 0 ? (
          <div className="space-y-2">
            <p className="text-bb-text-3 text-sm text-center py-2">No wallet detected</p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 bg-bb-navy border border-bb-border hover:border-bb-blue/40 rounded-lg text-bb-text text-sm transition-colors"
            >
              <span className="w-6 h-6 rounded bg-[#E8821C] flex items-center justify-center text-white text-xs font-bold">M</span>
              Install MetaMask
              <ExternalLink size={12} className="ml-auto text-bb-text-3" />
            </a>
            <a
              href="https://www.coinbase.com/wallet/downloads"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 bg-bb-navy border border-bb-border hover:border-bb-blue/40 rounded-lg text-bb-text text-sm transition-colors"
            >
              <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">C</span>
              Install Coinbase Wallet
              <ExternalLink size={12} className="ml-auto text-bb-text-3" />
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {unique.map(connector => {
              const isConnecting = connecting === connector.id && isPending;
              return (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-bb-navy border border-bb-border hover:border-bb-blue/40 rounded-lg text-bb-text text-sm transition-colors disabled:opacity-60"
                >
                  {/* Icon: use EIP-6963 icon if available */}
                  {(connector as { icon?: string }).icon ? (
                    <img
                      src={(connector as { icon: string }).icon}
                      alt={connector.name}
                      className="w-6 h-6 rounded"
                    />
                  ) : (
                    <Wallet size={18} className="text-bb-blue" />
                  )}
                  <span className="font-medium">{connectorLabel(connector.name)}</span>
                  {isConnecting ? (
                    <span className="ml-auto w-4 h-4 rounded-full border-2 border-bb-blue/30 border-t-bb-blue animate-spin" />
                  ) : (
                    <ChevronRight size={14} className="ml-auto text-bb-text-3" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <p className="text-bb-text-3 text-[10px] font-mono text-center mt-4">
          Make sure your wallet is set to Base Network
        </p>
      </div>
    </div>
  );
}

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
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
      connect({ connector: { id: "injected" } as Parameters<typeof connect>[0]["connector"] });
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

    // Mobile without MetaMask browser → deep-link into MetaMask app
    if (mobile && !isMetaMaskBrowser()) {
      openInMetaMask();
      return;
    }

    // Desktop or MetaMask mobile browser → show wallet picker
    setShowPicker(true);
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
        {showPicker && <WalletPickerModal onClose={() => setShowPicker(false)} />}
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
