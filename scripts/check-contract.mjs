import { createPublicClient, http, fallback } from "viem";
import { base } from "viem/chains";

const CONTRACT = "0x20D2AC04c0753D31087c798170b2B8D6BdA7c5ba";
const ABI = [
  { name: "settled",             type: "function", inputs: [], outputs: [{ type: "bool" }],    stateMutability: "view" },
  { name: "winningOutcomeIndex", type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "totalCollateral",     type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "outcomeCount",        type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { name: "outcomes",            type: "function", inputs: [{ name: "index", type: "uint256" }], outputs: [{ name: "label", type: "string" }, { name: "totalShares", type: "uint256" }], stateMutability: "view" },
];

const client = createPublicClient({
  chain: base,
  transport: fallback([http("https://mainnet.base.org"), http("https://base.llamarpc.com")]),
});

const [settled, totalCollateral, outcomeCount] = await Promise.all([
  client.readContract({ abi: ABI, address: CONTRACT, functionName: "settled" }),
  client.readContract({ abi: ABI, address: CONTRACT, functionName: "totalCollateral" }).catch(() => 0n),
  client.readContract({ abi: ABI, address: CONTRACT, functionName: "outcomeCount" }).catch(() => null),
]);

console.log("settled          :", settled);
console.log("totalCollateral  :", (Number(totalCollateral) / 1e6).toFixed(2), "USDC");
console.log("outcomeCount     :", outcomeCount?.toString() ?? "N/A");

for (let i = 0; i < 3; i++) {
  try {
    const [label, shares] = await client.readContract({ abi: ABI, address: CONTRACT, functionName: "outcomes", args: [BigInt(i)] });
    console.log(`outcome[${i}]       : "${label}"  shares=${(Number(shares) / 1e6).toFixed(4)}`);
  } catch {
    break;
  }
}

if (settled) {
  try {
    const winIdx = await client.readContract({ abi: ABI, address: CONTRACT, functionName: "winningOutcomeIndex" });
    console.log("winningOutcomeIndex:", winIdx.toString());
  } catch (e) {
    console.log("winningOutcomeIndex: error reading");
  }
}
