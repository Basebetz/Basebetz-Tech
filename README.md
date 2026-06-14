# BASEBETZ

**Prediction markets for the 2026 FIFA World Cup — built natively on Base.**

Place bets on match outcomes using USDC. Markets are parimutuel: every dollar goes into a shared pool, winners split proportionally. No house edge on outcomes — fees go to creators, liquidity providers, and the treasury.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Web3 | Wagmi v2, Viem, Base Mainnet (Chain ID 8453) |
| Smart Contracts | Solidity 0.8.24, Foundry (forge build / forge test) |
| Database | MongoDB Atlas |
| AI | Google Gemini API (match predictions) |
| Data | Football-Data.org API v4 (live match results) |
| Deployment | Vercel (frontend), Base Mainnet (contracts) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
│  Next.js App  ←→  Wagmi/Viem  ←→  MetaMask / Wallet    │
└────────────────────────┬────────────────────────────────┘
                         │ USDC on Base
         ┌───────────────▼───────────────┐
         │        MarketFactory           │
         │  registerFixture (oracle)      │
         │  deployAndBuy (user pays gas)  │
         └───────────────┬───────────────┘
                         │ deploys
         ┌───────────────▼───────────────┐
         │       PredictionMarket         │
         │  buyShares / sellShares        │
         │  postResult (oracle only)      │
         │  claimWinnings                 │
         └───────────────┬───────────────┘
                         │ settlement
         ┌───────────────▼───────────────┐
         │        OracleResolver          │
         │  submitResult (2-of-N sources) │
         │  disputeResolution (gov)       │
         └───────────────────────────────┘
```

---

## Smart Contracts (Base Mainnet)

| Contract | Address |
|---|---|
| MarketFactory | `0xc3C717f281Eb8151888f625256A365eC0d6b8f41` |
| OracleResolver | `0x693Bf574eB093180f5EC2e3C57e0884fEbA1ac38` |
| FeeVault | `0x93eF51Ff1d6d9F135d980B72b8e0a5D6a52eebed` |
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

### How markets work

1. **Oracle registers a fixture** — cheap on-chain storage (~50K gas), no contract deployment
2. **First user deploys the market** — calls `factory.deployAndBuy(fixtureId, outcomeIndex, usdcAmount)` paying full deployment gas and earning the **creator fee share (10% of all future trading fees)**
3. **Users trade** — buy or sell shares of any outcome before kickoff
4. **Oracle settles** — cron job calls `OracleResolver.submitResult(market, winningIndex)` from 2 registered sources; 2-of-2 confirmation auto-posts result on-chain
5. **Winners claim** — `market.claimWinnings()` distributes the pool proportionally

### Fee structure

| Recipient | Share |
|---|---|
| Treasury | 60% |
| Liquidity pool | 30% |
| Market creator | 10% |

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster
- Football-Data.org API key (free tier)
- Google Gemini API key
- MetaMask or any Base-compatible wallet

### Setup

```bash
git clone https://github.com/Basebetz/Basebetz-Tech
cd Basebetz-Tech
npm install

cp .env.example .env
# Fill in your keys in .env

npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for AI predictions |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `FOOTBALL_DATA_API_KEY` | Football-Data.org API key |
| `ORACLE_PRIVATE_KEY` | Oracle wallet private key (fixture registration + settlement) |

---

## Scripts

```bash
# Register all future WC2026 fixtures on-chain (oracle wallet)
npm run register-fixtures

# Deploy a new MarketFactory and update FeeVault pointer
npm run deploy-factory

# Deploy markets directly (oracle-pays path, legacy)
npm run deploy-markets

# Dry-run any script without sending transactions
npm run register-fixtures:dry
```

---

## Settlement Oracle

The oracle cron (separate repo: `basebetz-oracle`) runs every 5 minutes and:

1. Queries MongoDB for markets with past kickoff and no settlement
2. Fetches match results from Football-Data.org API
3. Determines winning outcome index (match winner / both-teams-score)
4. Submits from 2 registered oracle wallets → triggers `OracleResolver` → `market.postResult()`
5. Marks market as settled in MongoDB

---

## Project Structure

```
├── app/
│   ├── page.tsx                 # Home — live markets + upcoming matches
│   ├── match/[id]/              # Match detail + trading panel
│   ├── tournament/              # WC2026 bracket and group pages
│   ├── portfolio/               # User positions and history
│   ├── leaderboard/             # Top traders
│   └── api/                     # REST API routes
│       ├── markets/             # Market data
│       ├── market/[id]/         # Single market + sync endpoint
│       ├── matches/             # Football-Data proxy
│       └── predictions/         # Gemini AI predictions
├── components/
│   ├── layout/                  # Navbar, MobileNav, Footer, SearchOverlay
│   ├── home/                    # HeroSection, MatchCard, LiveTicker, etc.
│   ├── match/                   # TradingPanel, OutcomePool, AIPrediction
│   ├── portfolio/               # PortfolioStats, PositionsTable
│   └── ui/                      # Badge, Button, WalletConnect, FlagImage, etc.
├── lib/
│   ├── contracts/               # ABIs, addresses, wagmi config
│   ├── db.ts                    # MongoDB client
│   ├── types.ts                 # Shared TypeScript types
│   ├── football-api.ts          # Football-Data.org client
│   └── predictions.ts           # Gemini prediction logic
├── scripts/
│   ├── deploy-factory.ts        # Deploy new MarketFactory
│   ├── register-fixtures.ts     # Register WC2026 fixtures on-chain
│   └── deploy-markets.ts        # Deploy individual markets (oracle-pays)
└── public/                      # Static assets, video background
```

---

## Contributing

Issues and PRs are welcome. Please open an issue first for significant changes.

---

## License

MIT
