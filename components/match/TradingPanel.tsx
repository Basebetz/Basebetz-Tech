"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, keccak256, toBytes, type Hash } from "viem";
import { Info, ArrowRight, CheckCircle, Wallet, Lock, Clock, AlertCircle, Rocket, ExternalLink } from "lucide-react";
import type { Market } from "@/lib/types";
import { formatUSDC, formatProbability, formatPrice, cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import ProbabilityBar from "@/components/ui/ProbabilityBar";
import { PREDICTION_MARKET_ABI, ERC20_ABI, MARKET_FACTORY_ABI } from "@/lib/contracts/abis";
import { ADDRESSES, USDC_DECIMALS } from "@/lib/contracts/addresses";

interface TradingPanelProps {
  market: Market & { contractAddress?: string };
}

type Step = "idle" | "approving" | "approved" | "buying" | "deploying" | "success";

function contractError(err: unknown): string {
  const msg = (err as { shortMessage?: string; message?: string })?.shortMessage
    ?? (err as { message?: string })?.message ?? "Transaction failed";
  if (msg.includes("TradingClosed"))        return "Trading is now closed for this market.";
  if (msg.includes("PositionLimitExceeded")) return "Position limit reached for your wallet.";
  if (msg.includes("ZeroAmount"))           return "Amount must be greater than zero.";
  if (msg.includes("BlockedUser"))          return "Your address is restricted from this market.";
  if (msg.includes("FixtureNotRegistered")) return "Market not yet registered by oracle. Check back soon.";
  if (msg.includes("MarketAlreadyExists"))  return "Market already deployed — refresh the page.";
  if (msg.includes("User rejected"))        return "Transaction cancelled.";
  return "Transaction failed. Try again.";
}

function claimError(err: unknown): string {
  const msg = (err as { shortMessage?: string; message?: string })?.shortMessage
    ?? (err as { message?: string })?.message ?? "";
  if (msg.includes("User rejected") || msg.includes("rejected"))
    return "Transaction cancelled.";
  // Any other claim failure = oracle hasn't finalized yet
  return "We're still calculating the win ratios. Please check back in a few minutes.";
}

function saveBetToPortfolio(params: {
  txHash: string; marketId: string; question: string;
  outcome: string; amount: string;
}) {
  try {
    const existing = JSON.parse(localStorage.getItem("basebetz_bets") ?? "[]");
    existing.unshift({ ...params, timestamp: new Date().toISOString() });
    localStorage.setItem("basebetz_bets", JSON.stringify(existing.slice(0, 50)));
  } catch { /* non-critical */ }
}

export default function TradingPanel({ market }: TradingPanelProps) {
  const { address, isConnected } = useAccount();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [approveHash, setApproveHash]   = useState<Hash | undefined>();
  const [buyHash,     setBuyHash]       = useState<Hash | undefined>();
  const [deployHash,  setDeployHash]    = useState<Hash | undefined>();
  const [lastTxHash,  setLastTxHash]    = useState<Hash | undefined>();
  const [txError, setTxError] = useState<string | null>(null);

  const contractAddress = market.contractAddress as `0x${string}` | undefined;
  // Markets without a deployed contract use the factory as the deploy+buy target
  const isDeployMode = !contractAddress;
  // Approval target: factory when deploying, market contract when already deployed
  const approvalTarget = isDeployMode ? ADDRESSES.FACTORY : contractAddress;

  const usdcRaw = amount && parseFloat(amount) > 0
    ? parseUnits(amount, USDC_DECIMALS)
    : 0n;

  // fixtureId = keccak256(market.id) — same hash used in contracts
  const fixtureId = keccak256(toBytes(market.id));

  // ── On-chain reads ────────────────────────────────────────────────────
  const { data: usdcBalance } = useReadContract({
    abi: ERC20_ABI, address: ADDRESSES.USDC,
    functionName: "balanceOf", args: [address!],
    query: { enabled: !!address },
  });

  const { data: allowance } = useReadContract({
    abi: ERC20_ABI, address: ADDRESSES.USDC,
    functionName: "allowance", args: [address!, approvalTarget!],
    query: { enabled: !!address && !!approvalTarget },
  });

  // Check if fixture is registered on-chain (deploy mode only)
  const { data: fixtureData } = useReadContract({
    abi: MARKET_FACTORY_ABI, address: ADDRESSES.FACTORY,
    functionName: "getFixture", args: [fixtureId],
    query: { enabled: isDeployMode },
  });
  const fixtureRegistered = fixtureData?.[6] === true;

  const { data: onChainSettled } = useReadContract({
    abi: PREDICTION_MARKET_ABI, address: contractAddress,
    functionName: "settled",
    query: { enabled: !!contractAddress },
  });

  const { data: winningIndex } = useReadContract({
    abi: PREDICTION_MARKET_ABI, address: contractAddress,
    functionName: "winningOutcomeIndex",
    query: { enabled: !!contractAddress && onChainSettled === true },
  });

  const { data: userWinShares } = useReadContract({
    abi: PREDICTION_MARKET_ABI, address: contractAddress,
    functionName: "positions", args: [address!, winningIndex!],
    query: { enabled: !!address && !!contractAddress && onChainSettled === true && winningIndex !== undefined },
  });

  // ── Trading close check (client-side, contract enforces on-chain) ─────
  const tradingCloseMs = new Date(market.closesAt).getTime() - 5 * 60 * 1000;
  const tradingOpen = Date.now() < tradingCloseMs && market.status !== "settled" && market.status !== "closed";

  // ── Write hooks ───────────────────────────────────────────────────────
  const { writeContract: doApprove, isPending: approvePending } = useWriteContract();
  const { writeContract: doBuy,     isPending: buyPending }     = useWriteContract();
  const { writeContract: doDeploy,  isPending: deployPending }  = useWriteContract();
  const { writeContract: doClaim,   isPending: claimPending }   = useWriteContract();

  const { isLoading: approveConfirming, isSuccess: approveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: buyConfirming,    isSuccess: buySuccess }    =
    useWaitForTransactionReceipt({ hash: buyHash });
  const { isLoading: deployConfirming, isSuccess: deploySuccess } =
    useWaitForTransactionReceipt({ hash: deployHash });

  // After approve confirms → move to buying/deploying step
  useEffect(() => {
    if (approveSuccess && step === "approving") setStep("approved");
  }, [approveSuccess, step]);

  // After buy confirms → success
  useEffect(() => {
    if (buySuccess && step === "buying" && buyHash) {
      setLastTxHash(buyHash);
      saveBetToPortfolio({
        txHash: buyHash,
        marketId: market.id,
        question: market.question,
        outcome: selectedIndex !== null ? (market.outcomes[selectedIndex]?.label ?? "") : "",
        amount,
      });
      setStep("success");
      setTimeout(() => { setStep("idle"); setAmount(""); setSelectedIndex(null); setBuyHash(undefined); setLastTxHash(undefined); }, 8000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buySuccess, step]);

  // After deployAndBuy confirms → sync address to MongoDB, then reload
  useEffect(() => {
    if (deploySuccess && step === "deploying" && deployHash) {
      setLastTxHash(deployHash);
      saveBetToPortfolio({
        txHash: deployHash,
        marketId: market.id,
        question: market.question,
        outcome: selectedIndex !== null ? (market.outcomes[selectedIndex]?.label ?? "") : "",
        amount,
      });
      setStep("success");
      fetch(`/api/market/${market.id}/sync`, { method: "POST" })
        .finally(() => setTimeout(() => window.location.reload(), 4000));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploySuccess, step, market.id]);

  const needsApproval = allowance !== undefined && usdcRaw > 0n && allowance < usdcRaw;
  const selected = selectedIndex !== null ? market.outcomes[selectedIndex] : null;
  const shares = selected && amount ? parseFloat(amount) / selected.price : 0;

  const handleApprove = () => {
    if (!approvalTarget || !usdcRaw) return;
    setTxError(null);
    setStep("approving");
    doApprove(
      { abi: ERC20_ABI, address: ADDRESSES.USDC, functionName: "approve", args: [approvalTarget, usdcRaw] },
      { onError: (e) => { setTxError(contractError(e)); setStep("idle"); },
        onSuccess: (h) => setApproveHash(h) }
    );
  };

  const handleBuy = () => {
    if (isDeployMode) {
      // Deploy + buy in one tx via factory
      if (selectedIndex === null || !usdcRaw) return;
      setTxError(null);
      setStep("deploying");
      doDeploy(
        { abi: MARKET_FACTORY_ABI, address: ADDRESSES.FACTORY,
          functionName: "deployAndBuy", args: [fixtureId, BigInt(selectedIndex), usdcRaw] },
        { onError: (e) => { setTxError(contractError(e)); setStep("idle"); },
          onSuccess: (h) => setDeployHash(h) }
      );
    } else {
      if (!contractAddress || selectedIndex === null || !usdcRaw) return;
      setTxError(null);
      setStep("buying");
      doBuy(
        { abi: PREDICTION_MARKET_ABI, address: contractAddress,
          functionName: "buyShares", args: [BigInt(selectedIndex), usdcRaw] },
        { onError: (e) => { setTxError(contractError(e)); setStep("idle"); },
          onSuccess: (h) => setBuyHash(h) }
      );
    }
  };

  const handleClaim = () => {
    if (!contractAddress) return;
    setTxError(null);
    doClaim(
      { abi: PREDICTION_MARKET_ABI, address: contractAddress, functionName: "claimWinnings" },
      { onError: (e) => setTxError(claimError(e)) }
    );
  };

  const isLoading = approvePending || approveConfirming || buyPending || buyConfirming || deployPending || deployConfirming;
  const settled = onChainSettled === true || market.status === "settled";
  const isWinner = settled && !!address && (userWinShares ?? 0n) > 0n;

  // ── Render helpers ────────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <div className="panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Trade Market</h3>
          <div className="flex items-center gap-1 text-bb-text-3 text-xs font-mono"><Info size={11} /><span>USDC · No leverage</span></div>
        </div>
        <p className="text-bb-text-2 text-sm leading-snug">{market.question}</p>
        <ProbabilityBar outcomes={market.outcomes} />
        <div className="py-6 text-center">
          <Wallet size={28} className="text-bb-blue/50 mx-auto mb-3" />
          <p className="text-bb-text font-heading font-semibold mb-1">Connect your wallet to trade</p>
          <p className="text-bb-text-3 text-xs font-mono">Base Network · USDC required</p>
        </div>
      </div>
    );
  }

  // ── Deploy-mode: market has no contract yet ───────────────────────────
  if (isDeployMode && tradingOpen) {
    if (!fixtureRegistered && fixtureData !== undefined) {
      // Fixture not yet registered by oracle
      return (
        <div className="panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Trade Market</h3>
            <div className="flex items-center gap-1 text-bb-text-3 text-xs font-mono"><Clock size={11} /><span>Coming soon</span></div>
          </div>
          <p className="text-bb-text-2 text-sm leading-snug">{market.question}</p>
          <ProbabilityBar outcomes={market.outcomes} />
          <div className="py-6 text-center">
            <Lock size={24} className="text-bb-gold/50 mx-auto mb-3" />
            <p className="text-bb-text font-heading font-semibold mb-1">Oracle preparing market</p>
            <p className="text-bb-text-3 text-xs font-mono">Fixture params not yet registered. Check back shortly.</p>
          </div>
        </div>
      );
    }

    // Fixture is registered — show full trade UI; first buyer deploys the contract
    return (
      <div className="panel p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Trade Market</h3>
          <div className="flex items-center gap-1 text-bb-blue text-xs font-mono">
            <Rocket size={11} /><span>You deploy this</span>
          </div>
        </div>

        <div className="bg-bb-blue/6 border border-bb-blue/20 rounded-lg px-3 py-2.5">
          <p className="text-bb-blue text-[11px] font-mono leading-relaxed">
            This market has no contract yet. Your first bet deploys it on Base — you pay the gas
            and earn the creator fee share (10% of all trading fees) as a reward.
          </p>
        </div>

        <p className="text-bb-text-2 text-sm leading-snug">{market.question}</p>
        <ProbabilityBar outcomes={market.outcomes} />

        {usdcBalance !== undefined && (
          <p className="text-bb-text-3 text-[10px] font-mono text-right">
            Balance: <span className="text-bb-text">{parseFloat(formatUnits(usdcBalance, USDC_DECIMALS)).toFixed(2)} USDC</span>
          </p>
        )}

        <div className="space-y-2">
          <p className="text-bb-text-3 text-xs font-mono uppercase tracking-widest">Select Outcome</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${market.outcomes.length}, 1fr)` }}>
            {market.outcomes.map((outcome, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button key={outcome.id} onClick={() => setSelectedIndex(isSelected ? null : idx)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 px-2 rounded-[35px] border text-center transition-all",
                    isSelected
                      ? "bg-bb-blue/10 border-bb-blue/40 shadow-glow-sm"
                      : "bg-bb-navy border-bb-border hover:border-bb-blue/30"
                  )}>
                  <span className={cn("font-heading font-bold text-sm", isSelected ? "text-bb-blue" : "text-bb-text")}>
                    {outcome.shortLabel}
                  </span>
                  <span className="font-mono text-xs text-bb-text-2">{formatProbability(outcome.probability)}</span>
                  <span className="font-mono text-xs text-bb-text-3">{formatPrice(outcome.price)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-bb-text-3 text-xs font-mono uppercase tracking-widest">Amount (USDC)</p>
          <div className="relative">
            <input type="number" min="1" step="1" placeholder="0.00" value={amount}
              onChange={e => { setAmount(e.target.value); setStep("idle"); }}
              disabled={selectedIndex === null}
              className={cn("bb-input pr-16", selectedIndex === null && "opacity-40 cursor-not-allowed")} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bb-text-3 text-xs font-mono">USDC</span>
          </div>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map(v => (
              <button key={v} onClick={() => { setAmount(String(v)); setStep("idle"); }}
                disabled={selectedIndex === null}
                className="flex-1 py-1 text-xs font-mono text-bb-text-3 hover:text-bb-text bg-bb-navy hover:bg-bb-blue/8 border border-bb-border hover:border-bb-blue/30 rounded-[35px] transition-all disabled:opacity-30">
                ${v}
              </button>
            ))}
          </div>
        </div>

        {selected && amount && parseFloat(amount) > 0 && (
          <div className="bg-bb-navy border border-bb-border rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-bb-text-3">Outcome</span>
              <span className="text-bb-text font-semibold">{selected.label}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-bb-text-3">Shares</span>
              <span className="text-bb-text">{shares.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-mono border-t border-bb-border pt-2">
              <span className="text-bb-text-3">Fee (1.5%)</span>
              <span className="text-bb-text-3">{formatUSDC(parseFloat(amount) * 0.015)} USDC</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-bb-text-3">Max Payout</span>
              <span className="text-bb-green font-bold">{formatUSDC(shares)} USDC</span>
            </div>
          </div>
        )}

        {txError && (
          <div className="flex items-center gap-2 text-bb-red text-xs font-mono bg-bb-red/6 border border-bb-red/20 rounded-lg px-3 py-2">
            <AlertCircle size={12} className="flex-shrink-0" />
            {txError}
          </div>
        )}

        {step === "success" ? (
          <div className="bg-bb-green/8 border border-bb-green/25 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-center gap-2 text-bb-green text-sm font-heading font-semibold">
              <CheckCircle size={16} /> Market deployed! Refreshing…
            </div>
            {lastTxHash && (
              <a
                href={`https://basescan.org/tx/${lastTxHash}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-bb-blue text-[11px] font-mono hover:underline"
              >
                <ExternalLink size={11} />
                {lastTxHash.slice(0, 12)}…{lastTxHash.slice(-8)} · View on Basescan
              </a>
            )}
          </div>
        ) : needsApproval && step !== "approved" ? (
          <div className="space-y-2">
            <Button variant="secondary" size="lg" className="w-full" loading={step === "approving" && isLoading}
              disabled={selectedIndex === null || !amount || parseFloat(amount) <= 0}
              onClick={handleApprove}>
              {step === "approving" && isLoading ? "Approving USDC…" : "1. Approve USDC"}
            </Button>
            <p className="text-bb-text-3 text-[10px] font-mono text-center">
              Approve USDC to the MarketFactory (one-time for this amount).
            </p>
          </div>
        ) : (
          <Button variant="primary" size="lg" className="w-full"
            loading={step === "deploying" && isLoading}
            disabled={selectedIndex === null || !amount || parseFloat(amount) <= 0}
            onClick={handleBuy}>
            {step === "deploying" && isLoading ? "Deploying on Base…" :
             step === "approved" ? "2. Deploy & Buy" : "Deploy & Buy"}
            {!(step === "deploying" && isLoading) && <Rocket size={15} />}
          </Button>
        )}
      </div>
    );
  }

  // No contract, trading closed (past kickoff)
  if (isDeployMode && !tradingOpen) {
    return (
      <div className="panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Trade Market</h3>
          <div className="flex items-center gap-1 text-bb-text-3 text-xs font-mono"><Clock size={11} /><span>Not Deployed</span></div>
        </div>
        <p className="text-bb-text-2 text-sm leading-snug">{market.question}</p>
        <ProbabilityBar outcomes={market.outcomes} />
        <div className="py-4 text-center">
          <Lock size={24} className="text-bb-text-3/50 mx-auto mb-2" />
          <p className="text-bb-text-3 text-xs font-mono">No one bet on this market before kickoff.</p>
          <p className="text-bb-text-3 text-xs font-mono mt-0.5">Market was never deployed — no funds at risk.</p>
        </div>
      </div>
    );
  }

  if (settled) {
    // Oracle hasn't posted the result on-chain yet (match finished but cron pending)
    const oracleReady = onChainSettled === true;

    return (
      <div className="panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Match Complete</h3>
          <span className={cn(
            "text-[10px] font-mono uppercase px-2 py-0.5 rounded border",
            oracleReady
              ? "border-bb-green/30 text-bb-green bg-bb-green/8"
              : "border-bb-gold/30 text-bb-gold bg-bb-gold/8"
          )}>
            {oracleReady ? "Settled" : "Finalising"}
          </span>
        </div>
        <p className="text-bb-text-2 text-sm">{market.question}</p>

        {market.settlementResult && oracleReady && (
          <div className="bg-bb-green/8 border border-bb-green/25 rounded-lg p-3 text-center">
            <p className="text-bb-text-3 text-[10px] font-mono uppercase tracking-widest mb-1">Result</p>
            <p className="text-bb-green font-heading font-bold text-lg">{market.settlementResult}</p>
          </div>
        )}

        {!oracleReady ? (
          <div className="py-4 text-center space-y-1">
            <div className="w-5 h-5 rounded-full border-2 border-bb-gold/30 border-t-bb-gold animate-spin mx-auto mb-2" />
            <p className="text-bb-text font-heading font-semibold text-sm">Calculating win ratios…</p>
            <p className="text-bb-text-3 text-xs font-mono">Results are being verified. Check back in a few minutes.</p>
          </div>
        ) : isWinner ? (
          <div className="space-y-2">
            <div className="bg-bb-gold/8 border border-bb-gold/25 rounded-lg p-3 text-center">
              <p className="text-bb-text-3 text-[10px] font-mono uppercase tracking-widest mb-1">Your Winnings</p>
              <p className="text-bb-gold font-display font-bold text-xl">
                {formatUnits(userWinShares ?? 0n, USDC_DECIMALS)} USDC
              </p>
            </div>
            <Button variant="primary" size="lg" className="w-full" loading={claimPending}
              onClick={handleClaim}>
              <CheckCircle size={15} /> Claim Winnings
            </Button>
          </div>
        ) : (
          <p className="text-center text-bb-text-3 text-xs font-mono py-2">No winnings to claim for this wallet.</p>
        )}

        {txError && (
          <p className="text-bb-red text-xs font-mono text-center">{txError}</p>
        )}
      </div>
    );
  }

  if (!tradingOpen) {
    return (
      <div className="panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Trade Market</h3>
          <div className="flex items-center gap-1 text-bb-text-3 text-xs font-mono"><Clock size={11} /><span>Trading Closed</span></div>
        </div>
        <p className="text-bb-text-2 text-sm leading-snug">{market.question}</p>
        <ProbabilityBar outcomes={market.outcomes} />
        <div className="py-4 text-center">
          <Clock size={24} className="text-bb-text-3/50 mx-auto mb-2" />
          <p className="text-bb-text-3 text-xs font-mono">Trading closed 5 minutes before kickoff.</p>
          <p className="text-bb-text-3 text-xs font-mono mt-0.5">Awaiting match result and oracle settlement.</p>
        </div>
      </div>
    );
  }

  // ── Main trading UI ───────────────────────────────────────────────────
  return (
    <div className="panel p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-bb-text uppercase tracking-wide text-sm">Trade Market</h3>
        <div className="flex items-center gap-1 text-bb-text-3 text-xs font-mono">
          <Info size={11} />
          <span>1.5% fee · USDC</span>
        </div>
      </div>

      <p className="text-bb-text-2 text-sm leading-snug">{market.question}</p>
      <ProbabilityBar outcomes={market.outcomes} />

      {usdcBalance !== undefined && (
        <p className="text-bb-text-3 text-[10px] font-mono text-right">
          Balance: <span className="text-bb-text">{parseFloat(formatUnits(usdcBalance, USDC_DECIMALS)).toFixed(2)} USDC</span>
        </p>
      )}

      {/* Outcome selection */}
      <div className="space-y-2">
        <p className="text-bb-text-3 text-xs font-mono uppercase tracking-widest">Select Outcome</p>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${market.outcomes.length}, 1fr)` }}>
          {market.outcomes.map((outcome, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button key={outcome.id} onClick={() => setSelectedIndex(isSelected ? null : idx)}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 px-2 rounded-[35px] border text-center transition-all",
                  isSelected
                    ? "bg-bb-blue/10 border-bb-blue/40 shadow-glow-sm"
                    : "bg-bb-navy border-bb-border hover:border-bb-blue/30"
                )}>
                <span className={cn("font-heading font-bold text-sm", isSelected ? "text-bb-blue" : "text-bb-text")}>
                  {outcome.shortLabel}
                </span>
                <span className="font-mono text-xs text-bb-text-2">{formatProbability(outcome.probability)}</span>
                <span className="font-mono text-xs text-bb-text-3">{formatPrice(outcome.price)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <p className="text-bb-text-3 text-xs font-mono uppercase tracking-widest">Amount (USDC)</p>
        <div className="relative">
          <input type="number" min="1" step="1" placeholder="0.00" value={amount}
            onChange={e => { setAmount(e.target.value); setStep("idle"); }}
            disabled={!selectedIndex !== false && selectedIndex === null}
            className={cn("bb-input pr-16", selectedIndex === null && "opacity-40 cursor-not-allowed")} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-bb-text-3 text-xs font-mono">USDC</span>
        </div>
        <div className="flex gap-2">
          {[10, 25, 50, 100].map(v => (
            <button key={v} onClick={() => { setAmount(String(v)); setStep("idle"); }}
              disabled={selectedIndex === null}
              className="flex-1 py-1 text-xs font-mono text-bb-text-3 hover:text-bb-text bg-bb-navy hover:bg-bb-blue/8 border border-bb-border hover:border-bb-blue/30 rounded-[35px] transition-all disabled:opacity-30">
              ${v}
            </button>
          ))}
        </div>
      </div>

      {/* Trade preview */}
      {selected && amount && parseFloat(amount) > 0 && (
        <div className="bg-bb-navy border border-bb-border rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-bb-text-3">Outcome</span>
            <span className="text-bb-text font-semibold">{selected.label}</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-bb-text-3">Entry Price</span>
            <span className="text-bb-text">{formatPrice(selected.price)}</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-bb-text-3">Shares</span>
            <span className="text-bb-text">{shares.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-mono border-t border-bb-border pt-2">
            <span className="text-bb-text-3">Fee (1.5%)</span>
            <span className="text-bb-text-3">{formatUSDC(parseFloat(amount) * 0.015)} USDC</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-bb-text-3">Max Payout</span>
            <span className="text-bb-green font-bold">{formatUSDC(shares)} USDC</span>
          </div>
        </div>
      )}

      {/* Error */}
      {txError && (
        <div className="flex items-center gap-2 text-bb-red text-xs font-mono bg-bb-red/6 border border-bb-red/20 rounded-lg px-3 py-2">
          <AlertCircle size={12} className="flex-shrink-0" />
          {txError}
        </div>
      )}

      {/* CTA */}
      {step === "success" ? (
        <div className="bg-bb-green/8 border border-bb-green/25 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-center gap-2 text-bb-green text-sm font-heading font-semibold">
            <CheckCircle size={16} /> Position confirmed on Base!
          </div>
          {lastTxHash && (
            <a
              href={`https://basescan.org/tx/${lastTxHash}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-bb-blue text-[11px] font-mono hover:underline"
            >
              <ExternalLink size={11} />
              {lastTxHash.slice(0, 12)}…{lastTxHash.slice(-8)} · View on Basescan
            </a>
          )}
        </div>
      ) : needsApproval && step !== "approved" ? (
        <div className="space-y-2">
          <Button variant="secondary" size="lg" className="w-full" loading={step === "approving" && isLoading}
            disabled={!selectedIndex !== false && selectedIndex === null || !amount || parseFloat(amount) <= 0}
            onClick={handleApprove}>
            {step === "approving" && isLoading ? "Approving USDC…" : "1. Approve USDC"}
          </Button>
          <p className="text-bb-text-3 text-[10px] font-mono text-center">
            One-time approval to allow this market to spend your USDC.
          </p>
        </div>
      ) : (
        <Button variant="primary" size="lg" className="w-full"
          loading={step === "buying" && isLoading}
          disabled={selectedIndex === null || !amount || parseFloat(amount) <= 0}
          onClick={handleBuy}>
          {step === "buying" && isLoading ? "Confirming on Base…" :
           step === "approved" ? "2. Buy Position" : "Buy Position"}
          {!(step === "buying" && isLoading) && <ArrowRight size={15} />}
        </Button>
      )}
    </div>
  );
}
