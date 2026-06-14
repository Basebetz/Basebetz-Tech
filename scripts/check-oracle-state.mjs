import { createPublicClient, http, fallback } from "viem";
import { base } from "viem/chains";

const MARKET = "0x20D2AC04c0753D31087c798170b2B8D6BdA7c5ba";
const ORACLE_RESOLVER = "0x693Bf574eB093180f5EC2e3C57e0884fEbA1ac38";

// From .env
const ORACLE_KEY_1 = process.env.ORACLE_PRIVATE_KEY; // might be ORACLE_KEY_1 in .env
const ORACLE_KEY_2 = process.env.ORACLE_KEY_2;

import { privateKeyToAccount } from "viem/accounts";

const ABI = [
  { name: "resultPosted", type: "function", inputs: [{ name: "", type: "address" }], outputs: [{ type: "bool" }], stateMutability: "view" },
  { name: "submissions", type: "function", inputs: [{ name: "market", type: "address" }, { name: "source", type: "address" }], outputs: [{ name: "winningOutcomeIndex", type: "uint256" }, { name: "submittedAt", type: "uint256" }, { name: "submitted", type: "bool" }], stateMutability: "view" },
  { name: "REQUIRED_CONFIRMATIONS", type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
];

const MARKET_ABI = [
  { name: "settled", type: "function", inputs: [], outputs: [{ type: "bool" }], stateMutability: "view" },
  { name: "winningOutcomeIndex", type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
];

const client = createPublicClient({
  chain: base,
  transport: fallback([http("https://mainnet.base.org"), http("https://base.llamarpc.com")]),
});

const [resultPosted, settled] = await Promise.all([
  client.readContract({ abi: ABI, address: ORACLE_RESOLVER, functionName: "resultPosted", args: [MARKET] }),
  client.readContract({ abi: MARKET_ABI, address: MARKET, functionName: "settled" }),
]);

console.log("=== OracleResolver State ===");
console.log("resultPosted[market]:", resultPosted);
console.log("");
console.log("=== Market Contract State ===");
console.log("settled:", settled);

// Check each oracle wallet's submission
const keys = [
  { label: "Oracle 1 (ORACLE_PRIVATE_KEY)", key: process.env.ORACLE_PRIVATE_KEY },
  { label: "Oracle 2 (ORACLE_KEY_2)", key: process.env.ORACLE_KEY_2 },
];
for (const { label, key } of keys) {
  if (!key) { console.log(`${label}: key not set`); continue; }
  try {
    const acct = privateKeyToAccount(key);
    const [winIdx, submittedAt, submitted] = await client.readContract({
      abi: ABI, address: ORACLE_RESOLVER, functionName: "submissions", args: [MARKET, acct.address]
    });
    console.log(`${label} (${acct.address.slice(0,10)}...): submitted=${submitted} outcome=${winIdx} at=${submittedAt > 0n ? new Date(Number(submittedAt)*1000).toISOString() : 'N/A'}`);
  } catch (e) {
    console.log(`${label}: error — ${e.shortMessage ?? e.message}`);
  }
}
