"use client";
import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import { base } from "wagmi/chains";
import {
  ExternalLink, Wallet, Briefcase, ArrowUpRight,
  Clock, CheckCircle, AlertCircle, ShieldAlert,
} from "lucide-react";
import { ERC20_ABI, PREDICTION_MARKET_ABI } from "@/lib/contracts/abis";
import { ADDRESSES, USDC_DECIMALS } from "@/lib/contracts/addresses";
import Badge from "@/components/ui/Badge";

interface BetRecord {
  txHash: string;
  marketId: string;
  question: string;
  outcome: string;
  amount: string;
  timestamp: string;
}

interface MarketData {
  status: string;
  contractAddress?: string;
  outcomes?: { label: string }[];
  winningOutcome?: number;
}

// ── Per-position row with on-chain state ─────────────────────────────────────
function BetRow({ bet, marketInfo }: { bet: BetRecord; marketInfo?: MarketData }) {
  const { address } = useAccount();
  const contractAddr = marketInfo?.contractAddress as `0x${string}` | undefined;

  const [claimState, setClaimState] = useState<"idle" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  // Poll settled() every 15s — flips to true once settleMkt() is called on-chain
  const { data: onChainSettled } = useReadContract({
    abi: PREDICTION_MARKET_ABI, address: contractAddr,
    functionName: "settled",
    query: { enabled: !!contractAddr, refetchInterval: 15_000 },
  });

  // Only read oraclePostedAt while not yet settled
  const { data: oraclePostedAt } = useReadContract({
    abi: PREDICTION_MARKET_ABI, address: contractAddr,
    functionName: "oraclePostedAt",
    query: { enabled: !!contractAddr && onChainSettled !== true },
  });

  const { data: winningIndex } = useReadContract({
    abi: PREDICTION_MARKET_ABI, address: contractAddr,
    functionName: "winningOutcomeIndex",
    query: {
      enabled: !!contractAddr && (
        onChainSettled === true || (!!oraclePostedAt && oraclePostedAt > 0n)
      ),
    },
  });

  const { data: userShares } = useReadContract({
    abi: PREDICTION_MARKET_ABI, address: contractAddr,
    functionName: "positions", args: [address!, winningIndex!],
    query: {
      enabled: !!address && !!contractAddr && onChainSettled === true && winningIndex !== undefined,
    },
  });

  const { writeContract: doClaim, isPending: claiming } = useWriteContract();

  // Derived states — gated purely on on-chain data, no hardcoded time constants
  const oraclePosted    = !!oraclePostedAt && oraclePostedAt > 0n;
  const inDisputeWindow = oraclePosted && onChainSettled !== true;
  const isWinner        = onChainSettled === true && !!address && (userShares ?? 0n) > 0n;
  const winLabel        = winningIndex !== undefined
    ? (marketInfo?.outcomes?.[Number(winningIndex)]?.label ?? null)
    : null;
  const dbSettled = marketInfo?.status === "settled";

  const handleClaim = () => {
    if (!contractAddr) return;
    setClaimState("idle");
    doClaim(
      { abi: PREDICTION_MARKET_ABI, address: contractAddr, functionName: "claimWinnings" },
      {
        onSuccess: () => setClaimState("success"),
        onError: (e) => {
          setClaimState("error");
          const msg = (e as { shortMessage?: string; message?: string })?.shortMessage ?? "";
          setErrMsg(msg.includes("User rejected") ? "Cancelled" : "Try again shortly");
        },
      }
    );
  };

  return (
    <div>
      {/* ── Main row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px_90px_90px_110px] gap-2 sm:gap-3 px-4 py-3 hover:bg-bb-navy/20 transition-colors">

        {/* Market */}
        <div>
          <p className="text-bb-text text-sm font-medium leading-snug">{bet.question}</p>
          <p className="text-bb-text-3 text-[10px] font-mono mt-0.5 flex items-center gap-1">
            <Clock size={9} />
            {new Date(bet.timestamp).toLocaleDateString("en-US", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>

        {/* Position */}
        <div className="flex items-center sm:block">
          <span className="text-bb-text-3 text-[10px] font-mono sm:hidden mr-2">Position:</span>
          <span className="text-bb-blue font-heading font-bold text-sm">{bet.outcome}</span>
        </div>

        {/* Amount */}
        <div className="flex items-center sm:block">
          <span className="text-bb-text-3 text-[10px] font-mono sm:hidden mr-2">Amount:</span>
          <span className="text-bb-green font-mono text-sm font-semibold">${bet.amount}</span>
        </div>

        {/* Status */}
        <div className="flex items-center sm:block">
          <span className="text-bb-text-3 text-[10px] font-mono sm:hidden mr-2">Status:</span>
          {claimState === "success" ? (
            <span className="text-bb-green text-[11px] font-mono flex items-center gap-1">
              <CheckCircle size={11} /> Claimed!
            </span>
          ) : onChainSettled === true ? (
            <Badge variant="settled">Settled</Badge>
          ) : inDisputeWindow ? (
            <span className="text-bb-blue text-[10px] font-mono flex items-center gap-1">
              <ShieldAlert size={9} /> Verifying
            </span>
          ) : dbSettled ? (
            <Badge variant="settled">Settled</Badge>
          ) : (
            <Badge variant="open">Open</Badge>
          )}
        </div>

        {/* Tx hash */}
        <div className="flex items-center sm:block">
          <span className="text-bb-text-3 text-[10px] font-mono sm:hidden mr-2">Tx:</span>
          <a
            href={`https://basescan.org/tx/${bet.txHash}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-bb-text-3 hover:text-bb-blue text-[11px] font-mono transition-colors"
          >
            {bet.txHash.slice(0, 8)}…{bet.txHash.slice(-6)}
            <ArrowUpRight size={10} />
          </a>
        </div>
      </div>

      {/* ── Dispute window banner ── */}
      {inDisputeWindow && claimState !== "success" && (
        <div className="mx-4 mb-3 rounded-lg border border-bb-blue/25 bg-bb-blue/6 px-4 py-3">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-bb-gold mt-0.5 flex-shrink-0" />
            <div className="space-y-0.5 flex-1">
              <p className="text-bb-text font-heading font-semibold text-sm">Dispute window active</p>
              {winLabel && (
                <p className="text-bb-text-3 text-xs font-mono">
                  Oracle result: <span className="text-bb-blue font-bold">{winLabel}</span>
                </p>
              )}
              <p className="text-bb-text-3 text-xs font-mono">
                Anyone can dispute this result during the verification period.
              </p>
              <p className="text-bb-text-3 text-xs font-mono">
                Claim button unlocks automatically after the window closes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Claim / winner banner ── */}
      {onChainSettled === true && isWinner && claimState !== "success" && (
        <div className="mx-4 mb-3 rounded-lg border border-bb-gold/30 bg-bb-gold/8 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-bb-gold font-heading font-bold text-sm">You won!</p>
              <p className="text-bb-text-3 text-xs font-mono">
                Payout: <span className="text-bb-gold font-bold">
                  ${parseFloat(formatUnits(userShares ?? 0n, USDC_DECIMALS)).toFixed(2)} USDC
                </span>
              </p>
            </div>
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="flex items-center gap-1.5 text-sm font-heading font-bold text-bb-navy bg-bb-gold hover:bg-bb-gold/80 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <CheckCircle size={14} />
              {claiming ? "Claiming…" : "Claim Winnings"}
            </button>
          </div>
          {claimState === "error" && (
            <p className="text-bb-red text-[11px] font-mono mt-2 flex items-center gap-1">
              <AlertCircle size={10} /> {errMsg}
            </p>
          )}
        </div>
      )}

      {/* ── No win banner ── */}
      {onChainSettled === true && !isWinner && address && userShares !== undefined && (
        <div className="mx-4 mb-3 rounded-lg border border-bb-border bg-bb-navy/40 px-4 py-2">
          <p className="text-bb-text-3 text-xs font-mono">No winnings to claim for this position.</p>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WalletBalances() {
  const { address, isConnected } = useAccount();
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("basebetz_bets") ?? "[]");
      setBets(stored);
      const ids: string[] = [...new Set((stored as BetRecord[]).map(b => b.marketId))];
      Promise.all(
        ids.map(id =>
          fetch(`/api/market/${id}`)
            .then(r => r.json())
            .then(d => ({
              id,
              status:          d.market?.status          ?? "open",
              contractAddress: d.market?.contractAddress ?? undefined,
              outcomes:        d.market?.outcomes        ?? [],
              winningOutcome:  d.market?.winningOutcome,
            }))
            .catch(() => ({ id, status: "open" }))
        )
      ).then(results => {
        const map: Record<string, MarketData> = {};
        results.forEach(r => { map[r.id] = r; });
        setMarketData(map);
      });
    } catch { setBets([]); }
  }, []);

  // USDC on Base
  const { data: usdcRaw } = useReadContract({
    abi: ERC20_ABI, address: ADDRESSES.USDC,
    functionName: "balanceOf", args: [address!],
    query: { enabled: !!address },
  });
  const usdcBalance = usdcRaw !== undefined
    ? parseFloat(formatUnits(usdcRaw, USDC_DECIMALS)).toLocaleString("en-US", { maximumFractionDigits: 2 })
    : null;

  // ETH on Base
  const { data: baseEthData } = useBalance({
    address, chainId: base.id,
    query: { enabled: !!address },
  });
  const baseEthBalance = baseEthData
    ? parseFloat(formatUnits(baseEthData.value, 18)).toFixed(5)
    : null;

  if (!isConnected || !address) {
    return (
      <div className="panel p-10 text-center bg-bb-navy/40 rounded-xl">
        <Wallet size={36} className="text-bb-blue/40 mx-auto mb-4" />
        <p className="text-bb-text font-heading font-bold text-lg mb-2">Connect your wallet</p>
        <p className="text-bb-text-3 text-sm font-mono">Your balances and positions will appear here once connected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Wallet Balances ── */}
      <div>
        <h2 className="font-heading font-bold text-sm text-bb-text uppercase tracking-wide mb-3">Wallet Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BalanceCard label="USDC" network="Base"
            value={usdcBalance ? `${usdcBalance} USDC` : "—"}
            color="green" explorerUrl={`https://basescan.org/address/${address}`} />
          <BalanceCard label="ETH" network="Base"
            value={baseEthBalance ? `${baseEthBalance} ETH` : "—"}
            color="blue" explorerUrl={`https://basescan.org/address/${address}`} />
        </div>
      </div>

      {/* ── Positions ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-sm text-bb-text uppercase tracking-wide flex items-center gap-2">
            <Briefcase size={14} className="text-bb-blue" />
            Positions
          </h2>
          <span className="text-bb-text-3 text-xs font-mono border border-bb-border px-3 py-1 rounded">
            {bets.length} {bets.length === 1 ? "position" : "positions"}
          </span>
        </div>

        {bets.length === 0 ? (
          <div className="panel p-8 text-center">
            <Briefcase size={28} className="text-bb-blue/30 mx-auto mb-3" />
            <p className="text-bb-text font-heading font-semibold mb-1">No positions yet</p>
            <p className="text-bb-text-3 text-xs font-mono">Place your first bet to see your positions here.</p>
          </div>
        ) : (
          <div className="panel overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_150px_90px_90px_110px] gap-3 px-4 py-3 border-b border-bb-border bg-bb-navy/50">
              {["Market", "Position", "Amount", "Status", "Transaction"].map(h => (
                <span key={h} className="text-[10px] font-mono text-bb-text-3 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            <div className="divide-y divide-bb-border/60">
              {bets.map((bet, i) => (
                <BetRow key={i} bet={bet} marketInfo={marketData[bet.marketId]} />
              ))}
            </div>
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
    green:  { border: "border-bb-green/25",   text: "text-bb-green",   bg: "bg-bb-green/6",   dot: "bg-bb-green" },
    blue:   { border: "border-bb-blue/25",    text: "text-bb-blue",    bg: "bg-bb-blue/6",    dot: "bg-bb-blue" },
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
