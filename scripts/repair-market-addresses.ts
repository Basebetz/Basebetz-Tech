/**
 * Repair script: fix MongoDB markets where contractAddress is 0x000...0
 *
 * The deploy script had a race condition reading marketsByFixture right after
 * the tx confirmed. This script re-queries the factory for each zero-address
 * market and writes the correct address back to MongoDB.
 *
 * Run: npm run repair-markets
 */

import "dotenv/config";
import {
  createPublicClient,
  http,
  keccak256,
  toBytes,
  zeroAddress,
} from "viem";
import { base } from "viem/chains";
import { MongoClient } from "mongodb";

const FACTORY_ADDRESS = "0xC1da749Df77Cf3f38AF2Db6cde84aaa2Ac644CeA" as const;

const FACTORY_ABI = [
  {
    type: "function",
    name: "marketsByFixture",
    inputs: [{ name: "fixtureId", type: "bytes32" }],
    outputs: [{ name: "market",   type: "address" }],
    stateMutability: "view",
  },
] as const;

const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;
const MONGODB_URI        = process.env.MONGODB_URI!;

if (!MONGODB_URI) { console.error("❌  MONGODB_URI missing"); process.exit(1); }

async function main() {
  const publicClient = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const col = mongo.db("basebetz").collection("markets");

  const zeroAddr = await col.find({ contractAddress: zeroAddress }).toArray();
  console.log(`\n🔧  Markets with zero address: ${zeroAddr.length}\n`);

  let fixed = 0, stillMissing = 0;

  for (const market of zeroAddr) {
    const marketId  = market.id as string;
    const fixtureId = keccak256(toBytes(marketId));

    process.stdout.write(`  ${marketId} … `);

    try {
      // Small delay to avoid rate-limiting
      await new Promise(r => setTimeout(r, 700));

      const addr = await publicClient.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: "marketsByFixture",
        args: [fixtureId],
      });

      if (addr === zeroAddress) {
        process.stdout.write(`still not on-chain\n`);
        stillMissing++;
      } else {
        await col.updateOne({ id: marketId }, { $set: { contractAddress: addr } });
        process.stdout.write(`✅  ${addr}\n`);
        fixed++;
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? String(err);
      process.stdout.write(`❌  ${msg.slice(0, 60)}\n`);
    }
  }

  await mongo.close();
  console.log(`\n─────────────────────────────`);
  console.log(`✅  Fixed:        ${fixed}`);
  console.log(`⚠️   Still zero:   ${stillMissing} (need to redeploy via deploy-markets)`);
  console.log(`─────────────────────────────\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
