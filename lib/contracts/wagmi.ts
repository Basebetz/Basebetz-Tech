import { http, createConfig } from "wagmi";
import { fallback } from "viem";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  // EIP-6963: auto-discovers all installed wallet extensions on desktop
  multiInjectedProviderDiscovery: true,
  transports: {
    [base.id]: fallback([
      http("https://mainnet.base.org"),
      http("https://base.llamarpc.com"),
    ]),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
