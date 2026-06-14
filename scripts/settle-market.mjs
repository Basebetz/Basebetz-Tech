/**
 * Checks on-chain settlement state for a market contract.
 * Usage: node -r dotenv/config scripts/settle-market.mjs <marketAddress>
 */
import "dotenv/config";
import { createPublicClient, http, fallback } from "viem";
import { base } from "viem/chains";

const MARKET = process.argv[2];
if (!MARKET || !MARKET.startsWith("0x")) {
  console.error("Usage: node -r dotenv/config scripts/settle-market.mjs <marketAddress>");
  process.exit(1);
}

const ABI = [
  { name: "settled",            type: "function", inputs: [], outputs: [{ type: "bool" }],    stateMutability: "view" },
  { name: "oraclePostedAt",     type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "winningOutcomeIndex",type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "kickoffTime",        type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "tradingCloseTime",   type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "totalCollateral",    type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "outcomes",           type: "function", inputs: [{ name: "i", type: "uint256" }], outputs: [{ name: "label", type: "string" }, { name: "shares", type: "uint256" }], stateMutability: "view" },
];

const pub = createPublicClient({
  chain: base,
  transport: fallback([http("https://mainnet.base.org"), http("https://base.llamarpc.com")]),
});

const [settled, oraclePostedAt, kickoffTime, tradingCloseTime, totalCollateral] = await Promise.all([
  pub.readContract({ abi: ABI, address: MARKET, functionName: "settled" }),
  pub.readContract({ abi: ABI, address: MARKET, functionName: "oraclePostedAt" }),
  pub.readContract({ abi: ABI, address: MARKET, functionName: "kickoffTime" }).catch(() => 0n),
  pub.readContract({ abi: ABI, address: MARKET, functionName: "tradingCloseTime" }).catch(() => 0n),
  pub.readContract({ abi: ABI, address: MARKET, functionName: "totalCollateral" }).catch(() => 0n),
]);

console.log("Market          :", MARKET);
console.log("settled         :", settled);
console.log("oraclePostedAt  :", oraclePostedAt > 0n ? new Date(Number(oraclePostedAt) * 1000).toISOString() : "not posted");
console.log("kickoffTime     :", kickoffTime > 0n ? new Date(Number(kickoffTime) * 1000).toISOString() : "N/A");
console.log("tradingCloseTime:", tradingCloseTime > 0n ? new Date(Number(tradingCloseTime) * 1000).toISOString() : "N/A");
console.log("totalCollateral :", (Number(totalCollateral) / 1e6).toFixed(2), "USDC");

if (settled) {
  const winIdx = await pub.readContract({ abi: ABI, address: MARKET, functionName: "winningOutcomeIndex" });
  const [label] = await pub.readContract({ abi: ABI, address: MARKET, functionName: "outcomes", args: [winIdx] });
  console.log("winningIndex    :", winIdx.toString(), `(${label})`);
}
