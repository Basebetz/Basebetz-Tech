/**
 * Oracle registers all WC 2026 fixture params on-chain (cheap: ~50 K gas each,
 * no contract deployment). After this, any user can call factory.deployAndBuy()
 * to deploy a market and place the first bet — user pays the heavy gas.
 *
 * Run:      npm run register-fixtures
 * Dry run:  npm run register-fixtures:dry
 */

import "dotenv/config";
import {
  createWalletClient,
  createPublicClient,
  http,
  fallback,
  keccak256,
  toBytes,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { MongoClient } from "mongodb";

// ── Update this after running deploy-factory.ts ───────────────────────────────
const FACTORY_ADDRESS = (process.env.FACTORY_ADDRESS ?? "0xc3C717f281Eb8151888f625256A365eC0d6b8f41") as `0x${string}`;

const DRY_RUN = process.env.DRY_RUN === "true";

// Multiple public Base RPC endpoints — fallback if one rate-limits us
const RPC_TRANSPORT = fallback([
  http("https://mainnet.base.org"),
  http("https://base.llamarpc.com"),
  http("https://base-mainnet.public.blastapi.io"),
  http("https://base.drpc.org"),
]);

async function withRetry<T>(fn: () => Promise<T>, retries = 4, baseDelayMs = 1500): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastErr;
}

const FACTORY_ABI = [
  {
    name: "registerFixture",
    type: "function",
    inputs: [
      { name: "fixtureId",          type: "bytes32"  },
      { name: "question",           type: "string"   },
      { name: "outcomeLabels",      type: "string[]" },
      { name: "kickoffTime",        type: "uint256"  },
      { name: "tradingCloseOffset", type: "uint256"  },
      { name: "disputeWindowSecs",  type: "uint256"  },
      { name: "settlementRuleHash", type: "bytes32"  },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getFixture",
    type: "function",
    inputs: [{ name: "fixtureId", type: "bytes32" }],
    outputs: [
      { name: "question",           type: "string"   },
      { name: "outcomeLabels",      type: "string[]" },
      { name: "kickoffTime",        type: "uint256"  },
      { name: "tradingCloseOffset", type: "uint256"  },
      { name: "disputeWindowSecs",  type: "uint256"  },
      { name: "settlementRuleHash", type: "bytes32"  },
      { name: "registered",         type: "bool"     },
    ],
    stateMutability: "view",
  },
] as const;

const TRADING_CLOSE_OFFSET = 300n;
const DISPUTE_WINDOW       = 7200n;

async function main() {
  const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY as `0x${string}`;
  const MONGODB_URI        = process.env.MONGODB_URI!;

  if (!ORACLE_PRIVATE_KEY) { console.error("❌  ORACLE_PRIVATE_KEY missing"); process.exit(1); }
  if (!MONGODB_URI)        { console.error("❌  MONGODB_URI missing");         process.exit(1); }

  const account   = privateKeyToAccount(ORACLE_PRIVATE_KEY);
  const wallet    = createWalletClient({ account, chain: base, transport: RPC_TRANSPORT });
  const pub       = createPublicClient({ chain: base, transport: RPC_TRANSPORT });

  const balance = await pub.getBalance({ address: account.address });
  console.log(`\n🔑  Oracle wallet: ${account.address}`);
  console.log(`💰  ETH balance:   ${formatEther(balance)} ETH`);
  console.log(`🏭  Factory:       ${FACTORY_ADDRESS}`);
  console.log(DRY_RUN ? "🔍  DRY RUN\n" : "🚀  LIVE RUN\n");

  if (!DRY_RUN && balance < 10_000_000_000_000n) { // 0.00001 ETH — 130 registrations cost ~0.0001 ETH total
    console.error("❌  Need at least 0.00001 ETH. Top up and retry.");
    process.exit(1);
  }

  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const col = mongo.db("basebetz").collection("markets");

  // All markets with future kickoff (filter by closesAt as proxy for kickoff)
  const cutoff = BigInt(Math.floor(Date.now() / 1000) + 10 * 60); // 10 min from now
  const all = await col.find().toArray();
  const deployable = all.filter(m => {
    const kickoffSecs = BigInt(Math.floor(new Date(m.closesAt as string).getTime() / 1000));
    return kickoffSecs > cutoff;
  });

  console.log(`📋  Total markets in DB:  ${all.length}`);
  console.log(`🎯  Future (registrable): ${deployable.length}\n`);

  let registered = 0, alreadyDone = 0, failed = 0;

  for (const market of deployable) {
    const marketId  = market.id as string;
    const fixtureId = keccak256(toBytes(marketId));
    const question  = market.question as string;
    const labels    = (market.outcomes as { label: string }[]).map(o => o.label);
    const kickoffTs = BigInt(Math.floor(new Date(market.closesAt as string).getTime() / 1000));
    const ruleHash  = keccak256(toBytes(market.type as string));

    process.stdout.write(`  ${marketId} … `);

    try {
      // Check if already registered on-chain
      const existing = await withRetry(() => pub.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "getFixture",
        args: [fixtureId],
      }));

      if (existing[6]) { // registered = true
        process.stdout.write(`already registered ⏭\n`);
        alreadyDone++;
        continue;
      }

      if (DRY_RUN) {
        process.stdout.write(`would register [${labels.join(", ")}]\n`);
        continue;
      }

      const hash = await withRetry(() => wallet.writeContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "registerFixture",
        args: [fixtureId, question, labels, kickoffTs, TRADING_CLOSE_OFFSET, DISPUTE_WINDOW, ruleHash],
      }));

      process.stdout.write(`tx ${hash.slice(0, 12)}… `);
      await withRetry(() => pub.waitForTransactionReceipt({ hash, confirmations: 1 }), 6, 3000);
      process.stdout.write(`✅\n`);
      registered++;

      await new Promise(r => setTimeout(r, 1200));

    } catch (err: unknown) {
      const msg = (err as { shortMessage?: string; message?: string })?.shortMessage
        ?? (err as { message?: string })?.message ?? String(err);
      process.stdout.write(`❌  ${msg.slice(0, 80)}\n`);
      failed++;
    }
  }

  await mongo.close();

  console.log(`\n──────────────────────────────`);
  console.log(`✅  Registered:      ${registered}`);
  console.log(`⏭   Already done:    ${alreadyDone}`);
  console.log(`❌  Failed:          ${failed}`);
  console.log(`──────────────────────────────\n`);
  console.log(`Users can now call factory.deployAndBuy(fixtureId, outcomeIndex, amount)`);
  console.log(`to deploy a market and place the first bet in one transaction.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
