/**
 * POST /api/market/[id]/sync
 * Called by the frontend after a successful deployAndBuy transaction.
 * Queries the factory on-chain for the deployed market address and
 * writes it to MongoDB so future page renders show the contract.
 */
import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, keccak256, toBytes, getAddress } from "viem";
import { base } from "viem/chains";
import { getDb } from "@/lib/db";
import { MARKET_FACTORY_ABI } from "@/lib/contracts/abis";
import { ADDRESSES } from "@/lib/contracts/addresses";

export const dynamic = "force-dynamic";

const pub = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const marketId  = params.id;
    const fixtureId = keccak256(toBytes(marketId));

    const onChainAddress = await pub.readContract({
      address: ADDRESSES.FACTORY,
      abi: MARKET_FACTORY_ABI,
      functionName: "marketsByFixture",
      args: [fixtureId],
    });

    const ZERO = "0x0000000000000000000000000000000000000000";
    if (!onChainAddress || onChainAddress === ZERO) {
      return NextResponse.json({ error: "Market not yet deployed on-chain" }, { status: 404 });
    }

    const contractAddress = getAddress(onChainAddress);
    const db = await getDb();
    const result = await db.collection("markets").updateOne(
      { id: marketId },
      { $set: { contractAddress } }
    );

    return NextResponse.json({ contractAddress, updated: result.modifiedCount > 0 });
  } catch (err) {
    console.error("[api/market/sync]", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
