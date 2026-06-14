import "dotenv/config";
import { MongoClient } from "mongodb";
import { createPublicClient, http, formatEther } from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

async function main() {
  const mongo = new MongoClient(process.env.MONGODB_URI!);
  await mongo.connect();
  const col = mongo.db("basebetz").collection("markets");

  const total    = await col.countDocuments();
  const deployed = await col.countDocuments({
    contractAddress: { $exists: true, $nin: [null, "0x0000000000000000000000000000000000000000"] },
  });
  const zeroAddr = await col.countDocuments({
    contractAddress: "0x0000000000000000000000000000000000000000",
  });
  const missing  = await col.countDocuments({
    $or: [{ contractAddress: { $exists: false } }, { contractAddress: null }],
  });

  // Sample a few pending ones
  const pendingSample = await col
    .find({
      $or: [
        { contractAddress: { $exists: false } },
        { contractAddress: null },
        { contractAddress: "0x0000000000000000000000000000000000000000" },
      ],
    })
    .limit(5)
    .toArray();

  console.log("\n📊  MongoDB market deployment status");
  console.log("─────────────────────────────────────");
  console.log(`  Total markets:           ${total}`);
  console.log(`  ✅  Deployed (real addr): ${deployed}`);
  console.log(`  ⚠️   Zero address:         ${zeroAddr}`);
  console.log(`  ❌  No address (pending): ${missing}`);
  console.log(`  Remaining to deploy:     ${zeroAddr + missing}`);

  if (pendingSample.length > 0) {
    console.log("\n  Sample pending markets:");
    for (const m of pendingSample) {
      console.log(`    ${m.id}  closesAt=${m.closesAt}  addr=${m.contractAddress ?? "none"}`);
    }
  }

  // ETH balance
  const account = privateKeyToAccount(process.env.ORACLE_PRIVATE_KEY as `0x${string}`);
  const pub = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
  const balance = await pub.getBalance({ address: account.address });
  console.log(`\n🔑  Oracle wallet: ${account.address}`);
  console.log(`💰  ETH balance:   ${formatEther(balance)} ETH`);

  await mongo.close();
}

main().catch(e => { console.error(e); process.exit(1); });
