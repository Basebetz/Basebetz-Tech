/**
 * Redeploys MarketFactory with the new deployAndBuy / registerFixture logic.
 * Also updates FeeVault's approved factory pointer.
 * Clears all contractAddress fields in MongoDB (old factory's markets are abandoned).
 *
 * Run once:  npx tsx scripts/deploy-factory.ts
 */

import "dotenv/config";
import {
  createWalletClient,
  createPublicClient,
  http,
  formatEther,
  getAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { join } from "path";

// ── Addresses ─────────────────────────────────────────────────────────────────
const ORACLE_RESOLVER = "0x693Bf574eB093180f5EC2e3C57e0884fEbA1ac38" as const;
const FEE_VAULT       = "0x93eF51Ff1d6d9F135d980B72b8e0a5D6a52eebed" as const;
const USDC            = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

// ── ABIs ──────────────────────────────────────────────────────────────────────
const FEE_VAULT_ABI = [
  {
    name: "setApprovedFactory",
    type: "function",
    inputs: [{ name: "_factory", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

// ── Load compiled bytecode ────────────────────────────────────────────────────
const CONTRACT_DIR = join(
  __dirname,
  "../../basebetz_contract/contracts/out/MarketFactory.sol"
);

function loadArtifact() {
  const raw = readFileSync(join(CONTRACT_DIR, "MarketFactory.json"), "utf8");
  const artifact = JSON.parse(raw);
  return {
    abi:      artifact.abi,
    bytecode: artifact.bytecode.object as `0x${string}`,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY as `0x${string}`;
  const MONGODB_URI        = process.env.MONGODB_URI!;

  if (!ORACLE_PRIVATE_KEY) { console.error("❌  ORACLE_PRIVATE_KEY missing"); process.exit(1); }
  if (!MONGODB_URI)        { console.error("❌  MONGODB_URI missing");         process.exit(1); }

  const account   = privateKeyToAccount(ORACLE_PRIVATE_KEY);
  const transport = http("https://mainnet.base.org");
  const wallet    = createWalletClient({ account, chain: base, transport });
  const pub       = createPublicClient({ chain: base, transport });

  const balance = await pub.getBalance({ address: account.address });
  console.log(`\n🔑  Deployer: ${account.address}`);
  console.log(`💰  Balance:  ${formatEther(balance)} ETH\n`);

  if (balance < 50_000_000_000_000n) { // 0.00005 ETH — factory deploy costs ~0.00001 ETH on Base
    console.error("❌  Need at least 0.00005 ETH. Top up and retry.");
    process.exit(1);
  }

  // 1. Deploy new MarketFactory ───────────────────────────────────────────────
  console.log("🚀  Deploying new MarketFactory…");
  const { abi, bytecode } = loadArtifact();

  const deployHash = await wallet.deployContract({
    abi,
    bytecode,
    args: [USDC, ORACLE_RESOLVER, FEE_VAULT],
  });

  console.log(`   tx: ${deployHash}`);
  const receipt = await pub.waitForTransactionReceipt({ hash: deployHash, confirmations: 2 });
  const newFactory = getAddress(receipt.contractAddress!);
  console.log(`✅  MarketFactory deployed: ${newFactory}\n`);

  // 2. Update FeeVault to point at new factory ────────────────────────────────
  console.log("🔗  Updating FeeVault.approvedFactory…");
  const fvHash = await wallet.writeContract({
    address: FEE_VAULT,
    abi: FEE_VAULT_ABI,
    functionName: "setApprovedFactory",
    args: [newFactory],
  });
  await pub.waitForTransactionReceipt({ hash: fvHash, confirmations: 1 });
  console.log(`✅  FeeVault updated\n`);

  // 3. Clear contractAddress from all markets in MongoDB ─────────────────────
  console.log("🗄   Clearing old contractAddresses from MongoDB…");
  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const col = mongo.db("basebetz").collection("markets");
  const result = await col.updateMany(
    {},
    { $unset: { contractAddress: "" } }
  );
  await mongo.close();
  console.log(`✅  Cleared ${result.modifiedCount} market records\n`);

  // 4. Summary ───────────────────────────────────────────────────────────────
  console.log("─────────────────────────────────────────────────────────────");
  console.log(`New factory:  ${newFactory}`);
  console.log("─────────────────────────────────────────────────────────────");
  console.log("\n📝  Next steps:");
  console.log(`   1. Update FACTORY_ADDRESS in scripts/deploy-markets.ts and scripts/register-fixtures.ts`);
  console.log(`   2. Update FACTORY_ADDRESS in components/match/TradingPanel.tsx`);
  console.log(`   3. Run: npm run register-fixtures  (registers all fixtures cheaply)`);
  console.log(`   4. Users can now call deployAndBuy — no oracle ETH needed for market deployment\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
