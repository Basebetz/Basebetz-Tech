"use client";
import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { base } from "wagmi/chains";
import { ExternalLink, Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import { ERC20_ABI } from "@/lib/contracts/abis";
import { ADDRESSES, USDC_DECIMALS } from "@/lib/contracts/addresses";
import { formatAddress } from "@/lib/utils";

interface BetRecord {
  txHash: string;
  marketId: string;
  question: string;
  outcome: string;
  amount: string;
  timestamp: string;
}

function useMaintnetEthBalance(address: `0x${string}` | undefined) {
  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    if (!address) { setBalance(null); return; }
    fetch("https://cloudflare-eth.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBalance", params: [address, "latest"], id: 1 }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.result) {
          const wei = BigInt(d.result);
          setBalance(parseFloat(formatUnits(wei, 18)).toFixed(5));
        }
      })
      .catch(() => setBalance(null));
  }, [address]);
  return balance;
}

export default function WalletBalances() {
  const { address, isConnected } = useAccount();
  const [bets, setBets] = useState<BetRecord[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("basebetz_bets") ?? "[]");
      setBets(stored);
    } catch { setBets([]); }
  }, []);

  // USDC on Base
  const { data: usdcRaw } = useReadContract({
    abi: ERC20_ABI,
    address: ADDRESSES.USDC,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
  });
  const usdcBalance = usdcRaw !== undefined
    ? parseFloat(formatUnits(usdcRaw, USDC_DECIMALS)).toLocaleString("en-US", { maximumFractionDigits: 2 })
    : null;

  // ETH on Base
  const { data: baseEthData } = useBalance({
    address,
    chainId: base.id,
    query: { enabled: !!address },
  });
  const baseEthBalance = baseEthData
    ? parseFloat(formatUnits(baseEthData.value, 18)).toFixed(5)
    : null;

  // ETH on Ethereum mainnet (raw RPC)
  const mainnetEthBalance = useMaintnetEthBalance(address);

  if (!isConnected || !address) {
    return (
      <div className="panel p-10 text-center bg-bb-navy/40 rounded-xl">
        <Wallet size={36} className="text-bb-blue/40 mx-auto mb-4" />
        <p className="text-bb-text font-heading font-bold text-lg mb-2">Connect your wallet</p>
        <p className="text-bb-text-3 text-sm font-mono">Your balances and bet history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div>
        <h2 className="font-heading font-bold text-sm text-bb-text uppercase tracking-wide mb-3">Wallet Balances</h2>
        <p className="text-bb-text-3 text-xs font-mono mb-4">{address}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BalanceCard
            label="USDC"
            network="Base"
            value={usdcBalance ? `${usdcBalance} USDC` : "—"}
            color="green"
            explorerUrl={`https://basescan.org/address/${address}`}
          />
          <BalanceCard
            label="ETH"
            network="Base"
            value={baseEthBalance ? `${baseEthBalance} ETH` : "—"}
            color="blue"
            explorerUrl={`https://basescan.org/address/${address}`}
          />
          <BalanceCard
            label="ETH"
            network="Ethereum"
            value={mainnetEthBalance ? `${mainnetEthBalance} ETH` : "—"}
            color="purple"
            explorerUrl={`https://etherscan.io/address/${address}`}
          />
        </div>
      </div>

      {/* Recent bet history */}
      <div>
        <h2 className="font-heading font-bold text-sm text-bb-text uppercase tracking-wide mb-3">
          <TrendingUp size={14} className="inline mr-2 text-bb-blue" />
          Recent Bets
        </h2>
        {bets.length === 0 ? (
          <div className="panel p-6 text-center text-bb-text-3 text-sm font-mono">
            No bets placed yet. Place your first bet to see transaction history.
          </div>
        ) : (
          <div className="space-y-2">
            {bets.map((bet, i) => (
              <div key={i} className="panel px-4 py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-bb-text text-sm font-medium truncate">{bet.question}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-bb-blue text-xs font-mono">{bet.outcome}</span>
                    <span className="text-bb-text-3 text-xs font-mono">${bet.amount} USDC</span>
                    <span className="text-bb-text-3 text-[10px] font-mono">
                      {new Date(bet.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <a
                  href={`https://basescan.org/tx/${bet.txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-bb-text-3 hover:text-bb-blue text-[11px] font-mono whitespace-nowrap flex-shrink-0 mt-0.5 transition-colors"
                >
                  {bet.txHash.slice(0, 8)}…{bet.txHash.slice(-6)}
                  <ArrowUpRight size={10} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BalanceCard({ label, network, value, color, explorerUrl }: {
  label: string; network: string; value: string;
  color: "green" | "blue" | "purple"; explorerUrl: string;
}) {
  const colors = {
    green:  { border: "border-bb-green/25",  text: "text-bb-green",  bg: "bg-bb-green/6",  dot: "bg-bb-green" },
    blue:   { border: "border-bb-blue/25",   text: "text-bb-blue",   bg: "bg-bb-blue/6",   dot: "bg-bb-blue" },
    purple: { border: "border-purple-500/25", text: "text-purple-400", bg: "bg-purple-500/6", dot: "bg-purple-400" },
  };
  const c = colors[color];

  return (
    <div className={`panel border ${c.border} ${c.bg} rounded-xl p-4 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          <span className="text-bb-text-3 text-[10px] font-mono uppercase tracking-widest">{network}</span>
        </div>
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
          className="text-bb-text-3 hover:text-bb-blue transition-colors">
          <ExternalLink size={11} />
        </a>
      </div>
      <p className={`font-display font-bold text-xl ${c.text}`}>{value}</p>
      <p className="text-bb-text-3 text-[10px] font-mono uppercase tracking-widest">{label}</p>
    </div>
  );
}
