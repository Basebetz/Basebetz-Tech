/**
 * One-time script: deploy all WC 2026 prediction markets on Base mainnet.
 *
 * Loops markets in MongoDB without a contractAddress, calls
 * factory.createMarket() via the oracle wallet, parses the deployed address
 * from the MarketCreated event in the receipt, and writes it to MongoDB.
 *
 * Run:     npm run deploy-markets
 * Dry run: npm run deploy-markets:dry
 */

import "dotenv/config";
import {
  createWalletClient,
  createPublicClient,
  http,
  keccak256,
  toBytes,
  formatEther,
  getAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { MongoClient } from "mongodb";

// ── Config ────────────────────────────────────────────────────────────────────

const FACTORY_ADDRESS = "0xc3C717f281Eb8151888f625256A365eC0d6b8f41" as const;
const TRADING_CLOSE_OFFSET = 300n;
const DISPUTE_WINDOW       = 7200n;
const DRY_RUN = process.env.DRY_RUN === "true";

// MarketCreated event signature
const MARKET_CREATED_TOPIC = keccak256(
  toBytes("MarketCreated(address,bytes32,string,string[],uint256)")
);

const FACTORY_ABI = [
  {
    type: "function",
    name: "createMarket",
    inputs: [
      { name: "fixtureId",          type: "bytes32"  },
      { name: "question",           type: "string"   },
      { name: "outcomeLabels",      type: "string[]" },
      { name: "kickoffTime",        type: "uint256"  },
      { name: "tradingCloseOffset", type: "uint256"  },
      { name: "disputeWindowSecs",  type: "uint256"  },
      { name: "settlementRuleHash", type: "bytes32"  },
    ],
    outputs: [{ name: "market", type: "address" }],
    stateMutability: "nonpayable",
  },
] as const;

// ── Env validation ────────────────────────────────────────────────────────────

const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY as `0x${string}`;
const MONGODB_URI        = process.env.MONGODB_URI!;

if (!ORACLE_PRIVATE_KEY) { console.error("❌  ORACLE_PRIVATE_KEY missing in .env"); process.exit(1); }
if (!MONGODB_URI)        { console.error("❌  MONGODB_URI missing in .env");         process.exit(1); }

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract market address from MarketCreated event topic[1] (indexed address). */
function parseMarketAddress(logs: readonly { topics: readonly string[] }[]): string | null {
  for (const log of logs) {
    if (log.topics[0]?.toLowerCase() === MARKET_CREATED_TOPIC.toLowerCase() && log.topics[1]) {
      // topics[1] is the address padded to 32 bytes — take last 20 bytes
      return getAddress("0x" + log.topics[1].slice(-40));
    }
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const account = privateKeyToAccount(ORACLE_PRIVATE_KEY);
  const transport = http("https://mainnet.base.org");
  const walletClient = createWalletClient({ account, chain: base, transport });
  const publicClient = createPublicClient({ chain: base, transport });

  // Balance check
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`\n🔑  Oracle wallet: ${account.address}`);
  console.log(`💰  ETH balance:   ${formatEther(balance)} ETH`);
  console.log(`🌐  Network:       Base Mainnet`);
  console.log(DRY_RUN ? "🔍  DRY RUN — no transactions sent\n" : "🚀  LIVE RUN\n");

  if (!DRY_RUN && balance < 5_000_000_000_000_000n) { // < 0.005 ETH
    console.error("❌  Insufficient ETH. Top up the oracle wallet and retry.");
    process.exit(1);
  }

  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const col = mongo.db("basebetz").collection("markets");

  // Markets without a real contract address
  const pending = await col.find({
    $or: [
      { contractAddress: { $exists: false } },
      { contractAddress: "0x0000000000000000000000000000000000000000" },
    ],
  }).toArray();

  // Only deployable: kickoff at least 10 minutes from now
  const cutoff = Date.now() + 10 * 60 * 1000;
  const deployable = pending.filter(m => new Date(m.closesAt as string).getTime() > cutoff);

  console.log(`📋  Pending (no address):  ${pending.length}`);
  console.log(`🎯  Deployable (future):   ${deployable.length}\n`);

  if (deployable.length === 0) {
    console.log("✅  Nothing to deploy.");
    await mongo.close();
    return;
  }

  let deployed = 0, skipped = 0, failed = 0;

  for (const market of deployable) {
    const marketId  = market.id as string;
    const fixtureId = keccak256(toBytes(marketId));
    const question  = market.question as string;
    const labels    = (market.outcomes as { label: string }[]).map(o => o.label);
    const kickoffTs = BigInt(Math.floor(new Date(market.closesAt as string).getTime() / 1000));
    const ruleHash  = keccak256(toBytes(market.type as string));

    process.stdout.write(`  ${marketId} … `);

    try {
      if (DRY_RUN) {
        process.stdout.write(`would deploy [${labels.join(", ")}]\n`);
        continue;
      }

      const hash = await walletClient.writeContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "createMarket",
        args: [fixtureId, question, labels, kickoffTs, TRADING_CLOSE_OFFSET, DISPUTE_WINDOW, ruleHash],
      });

      process.stdout.write(`tx ${hash.slice(0, 12)}… `);

      const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });

      // Parse address from MarketCreated event — reliable regardless of node state lag
      const contractAddress = parseMarketAddress(receipt.logs as { topics: string[] }[]);

      if (!contractAddress) {
        process.stdout.write(`❌  Could not parse MarketCreated event\n`);
        failed++;
        continue;
      }

      await col.updateOne({ id: marketId }, { $set: { contractAddress } });
      process.stdout.write(`✅  ${contractAddress}\n`);
      deployed++;

      await new Promise(r => setTimeout(r, 1500));

    } catch (err: unknown) {
      const msg = (err as { shortMessage?: string; message?: string })?.shortMessage
        ?? (err as { message?: string })?.message ?? String(err);
      // Decode known revert codes
      const friendly = msg.includes("0x7fe2d393") ? "already exists"
        : msg.includes("0xa86b6512") ? "kickoff in the past (match already played)"
        : msg.includes("InvalidParams")       ? "invalid params (past kickoff?)"
        : msg.includes("Unauthorized")        ? "wallet not approved creator"
        : msg;
      process.stdout.write(`❌  ${friendly}\n`);
      failed++;
    }
  }

  await mongo.close();

  console.log(`\n─────────────────────────────`);
  console.log(`✅  Deployed:  ${deployed}`);
  console.log(`⏭   Skipped:   ${skipped}`);
  console.log(`❌  Failed:    ${failed}`);
  console.log(`─────────────────────────────\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
