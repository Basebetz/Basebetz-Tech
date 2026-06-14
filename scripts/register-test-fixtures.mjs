/**
 * One-shot: register mw-fd-537346 and bts-fd-537346 on-chain
 * Run: node scripts/register-test-fixtures.mjs
 */
import "dotenv/config";
import { createPublicClient, createWalletClient, http, keccak256, toBytes, fallback, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { MongoClient } from "mongodb";

const FACTORY = "0xc3C717f281Eb8151888f625256A365eC0d6b8f41";
const FACTORY_ABI = [
  {
    name: "registerFixture", type: "function",
    inputs: [
      { name: "fixtureId",          type: "bytes32" },
      { name: "question",           type: "string"  },
      { name: "outcomeLabels",      type: "string[]"},
      { name: "kickoffTime",        type: "uint256" },
      { name: "tradingCloseOffset", type: "uint256" },
      { name: "disputeWindowSecs",  type: "uint256" },
      { name: "settlementRuleHash", type: "bytes32" },
    ],
    outputs: [], stateMutability: "nonpayable",
  },
  {
    name: "getFixture", type: "function",
    inputs: [{ name: "fixtureId", type: "bytes32" }],
    outputs: [
      { name: "question", type: "string" }, { name: "outcomeLabels", type: "string[]" },
      { name: "kickoffTime", type: "uint256" }, { name: "tradingCloseOffset", type: "uint256" },
      { name: "disputeWindowSecs", type: "uint256" }, { name: "settlementRuleHash", type: "bytes32" },
      { name: "registered", type: "bool" },
    ], stateMutability: "view",
  },
];

const TRADING_CLOSE_OFFSET = 300n;
const DISPUTE_WINDOW       = 600n; // 10 minutes
const TARGET_IDS           = ["mw-fd-537346", "bts-fd-537346"];

const transport = fallback([
  http("https://mainnet.base.org"),
  http("https://base.llamarpc.com"),
  http("https://base-mainnet.public.blastapi.io"),
]);

const key = process.env.ORACLE_PRIVATE_KEY;
if (!key) { console.error("ORACLE_PRIVATE_KEY not set"); process.exit(1); }

const account   = privateKeyToAccount(key);
const wallet    = createWalletClient({ account, chain: base, transport });
const pub       = createPublicClient({ chain: base, transport });

const bal = await pub.getBalance({ address: account.address });
console.log(`Wallet: ${account.address}  balance: ${formatEther(bal)} ETH`);

const mongo = new MongoClient(process.env.MONGODB_URI);
await mongo.connect();
const db  = mongo.db();
const col = db.collection("markets");

for (const marketId of TARGET_IDS) {
  const market = await col.findOne({ id: marketId });
  if (!market) { console.log(`${marketId}: not found in DB`); continue; }

  const fixtureId = keccak256(toBytes(marketId));
  const question  = market.question;
  const labels    = market.outcomes.map(o => o.label);
  const kickoffTs = BigInt(Math.floor(new Date(market.closesAt).getTime() / 1000));
  const ruleHash  = keccak256(toBytes(market.type));

  // Check already registered
  const existing = await pub.readContract({ abi: FACTORY_ABI, address: FACTORY, functionName: "getFixture", args: [fixtureId] });
  if (existing[6]) {
    console.log(`${marketId}: already registered ✓`);
    continue;
  }

  console.log(`${marketId}: registering…`);
  console.log(`  question   : ${question}`);
  console.log(`  labels     : ${labels.join(", ")}`);
  console.log(`  kickoffTime: ${kickoffTs} (${new Date(market.closesAt).toISOString()})`);

  const hash = await wallet.writeContract({
    abi: FACTORY_ABI, address: FACTORY,
    functionName: "registerFixture",
    args: [fixtureId, question, labels, kickoffTs, TRADING_CLOSE_OFFSET, DISPUTE_WINDOW, ruleHash],
  });
  console.log(`  tx: ${hash}`);

  const receipt = await pub.waitForTransactionReceipt({ hash });
  console.log(`  ${receipt.status === "success" ? "✅ registered" : "❌ failed"}`);
}

await mongo.close();
console.log("\nDone.");
