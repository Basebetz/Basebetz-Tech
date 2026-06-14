// Base Mainnet (Chain ID: 8453) — deployed contracts
export const ADDRESSES = {
  FACTORY:          "0xc3C717f281Eb8151888f625256A365eC0d6b8f41" as `0x${string}`,
  ORACLE_RESOLVER:  "0x693Bf574eB093180f5EC2e3C57e0884fEbA1ac38" as `0x${string}`,
  FEE_VAULT:        "0x93eF51Ff1d6d9F135d980B72b8e0a5D6a52eebed" as `0x${string}`,
  // USDC on Base Mainnet
  USDC:             "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`,
} as const;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// Trading closes 5 minutes before kickoff
export const TRADING_CLOSE_OFFSET_SECS = 300n;

// 2-hour dispute window
export const DISPUTE_WINDOW_SECS = 7200n;
