/**
 * Emergency manual finalization: calls settleMkt() on a market contract
 * once the oracle has posted a result and the dispute window has passed.
 *
 * The oracle handles this automatically — only use this script if the
 * oracle worker missed a market or for manual intervention.
 *
 * Usage: node -r dotenv/config scripts/finalize-market.mjs <marketAddress>
 * Example: node -r dotenv/config scripts/finalize-market.mjs 0xABC...
 */
import "dotenv/config";
import { createPublicClient, createWalletClient, http, fallback, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const MARKET = process.argv[2];
if (!MARKET || !MARKET.startsWith("0x")) {
  console.error("Usage: node -r dotenv/config scripts/finalize-market.mjs <marketAddress>");
  process.exit(1);
}

const ABI = [
  { name: "settled",            type: "function", inputs: [], outputs: [{ type: "bool" }],    stateMutability: "view" },
  { name: "settleMkt",          type: "function", inputs: [], outputs: [],                    stateMutability: "nonpayable" },
  { name: "oraclePostedAt",     type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "winningOutcomeIndex",type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
];

const transport = fallback([http("https://mainnet.base.org"), http("https://base.llamarpc.com")]);
const key = process.env.ORACLE_PRIVATE_KEY ?? process.env.ORACLE_KEY_1;
if (!key) throw new Error("ORACLE_PRIVATE_KEY or ORACLE_KEY_1 not in .env");

const account = privateKeyToAccount(key);
const pub     = createPublicClient({ chain: base, transport });
const wallet  = createWalletClient({ account, chain: base, transport });

const [settled, oraclePostedAt] = await Promise.all([
  pub.readContract({ abi: ABI, address: MARKET, functionName: "settled" }),
  pub.readContract({ abi: ABI, address: MARKET, functionName: "oraclePostedAt" }),
]);

console.log("Market          :", MARKET);
console.log("settled         :", settled);
console.log("oraclePostedAt  :", oraclePostedAt > 0n ? new Date(Number(oraclePostedAt) * 1000).toISOString() : "not posted");

if (settled) {
  const winIdx = await pub.readContract({ abi: ABI, address: MARKET, functionName: "winningOutcomeIndex" });
  console.log("winningIndex    :", winIdx.toString());
  console.log("Already settled on-chain.");
  process.exit(0);
}

if (oraclePostedAt === 0n) {
  console.error("Oracle has not posted a result yet. Run the oracle first.");
  process.exit(1);
}

const bal = await pub.getBalance({ address: account.address });
console.log(`Wallet          : ${account.address}  ${formatEther(bal)} ETH`);
console.log("Calling settleMkt()…");

try {
  const hash = await wallet.writeContract({ abi: ABI, address: MARKET, functionName: "settleMkt" });
  console.log("tx:", hash);
  const receipt = await pub.waitForTransactionReceipt({ hash, confirmations: 1 });
  if (receipt.status === "success") {
    const winIdx = await pub.readContract({ abi: ABI, address: MARKET, functionName: "winningOutcomeIndex" });
    console.log(`✅ Settled — winningOutcomeIndex: ${winIdx}`);
  } else {
    console.error("❌ Transaction reverted");
  }
} catch (err) {
  console.error("❌ Failed:", err.shortMessage ?? err.message);
}
