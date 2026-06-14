import { createPublicClient, http, keccak256, toBytes, fallback } from "viem";
import { base } from "viem/chains";

const FACTORY = "0xc3C717f281Eb8151888f625256A365eC0d6b8f41";
const FACTORY_ABI = [
  { type: "function", name: "getFixture", inputs: [{ name: "fixtureId", type: "bytes32" }],
    outputs: [
      { name: "question", type: "string" },
      { name: "outcomeLabels", type: "string[]" },
      { name: "kickoffTime", type: "uint256" },
      { name: "tradingCloseOffset", type: "uint256" },
      { name: "disputeWindowSecs", type: "uint256" },
      { name: "settlementRuleHash", type: "bytes32" },
      { name: "registered", type: "bool" }
    ], stateMutability: "view"
  },
];

const client = createPublicClient({
  chain: base,
  transport: fallback([http("https://mainnet.base.org"), http("https://base.llamarpc.com")]),
});

for (const marketId of ["mw-fd-537346", "bts-fd-537346"]) {
  const fixtureId = keccak256(toBytes(marketId));
  const data = await client.readContract({
    abi: FACTORY_ABI, address: FACTORY,
    functionName: "getFixture", args: [fixtureId],
  });
  console.log(marketId, "→ registered:", data[6]);
}
