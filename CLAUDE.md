# tap-to-trade

Grid-based trading game on Solana with real-time price feeds from Bulk.trade exchange.

## Tech Stack

- **Monorepo**: Bun workspaces + Turborepo
- **Frontend** (`apps/web`): React 19, Vite 6, Zustand, Framer Motion, Lightweight Charts
- **Backend** (`apps/server`): Hono on Bun runtime, PostgreSQL (via `postgres` driver, raw SQL), WebSockets
- **Auth**: Privy (Twitter OAuth + embedded Solana wallets)
- **Shared** (`packages/shared`): TypeScript types and constants, no runtime deps
- **Blockchain**: Solana (`@solana/web3.js`, `@solana/spl-token`)

## Project Structure

```
apps/
  web/          → React frontend (Vite dev server on :5173)
  server/       → Hono API server on Bun (:3001)
packages/
  shared/       → Types (GridCell, Position, Trade, User, WSMessage) + constants
```

## Commands

```bash
bun run dev          # Start all dev servers (turbo)
bun run build        # Build all packages
bun run typecheck    # Type-check all packages

# Per-app
cd apps/web && bun run dev        # Vite dev server
cd apps/server && bun --watch src/index.ts   # Server with watch
cd apps/web && bun run test:e2e   # Playwright E2E tests
```

## Architecture

- Frontend authenticates via Privy, verifies token with backend (`POST /api/auth/verify`)
- Server connects upstream to Bulk.trade WebSocket for price feeds
- Price ticks broadcast to all browser clients via `/ws` endpoint
- Trade orders submitted via `POST /api/order`, closed trades recorded via `POST /api/trades`
- Leaderboard computed from trade history in PostgreSQL

### API Endpoints

- `POST /api/auth/verify` — Verify Privy token, get/create user
- `POST /api/order` — Submit trade order
- `POST /api/faucet` — Request testnet tokens
- `POST /api/account` — Query trading account from Bulk.trade
- `POST /api/trades` — Record closed trades
- `GET /api/leaderboard` — Fetch leaderboard
- `GET /api/trades/:userId` — User trade history
- `GET /api/health` — Health check

## Environment

Vite only loads `.env` from its own project root (`apps/web/`), not the monorepo root.

- `apps/web/.env` — must have `VITE_PRIVY_APP_ID`, `VITE_SERVER_URL`, `VITE_WS_URL`
- `apps/server/.env` — must have `DATABASE_URL`, `BULK_API_URL`, `BULK_WS_URL`, `PRIVY_APP_ID`, `PRIVY_APP_SECRET`, `PORT`
- Root `.env.example` has the template for all vars

## Key Conventions

- Shared types live in `@tap-to-trade/shared` — import from there, don't duplicate
- Server uses raw SQL via `postgres` library, no ORM
- Frontend state managed with Zustand stores (`apps/web/src/store/`)
- WebSocket messages typed as `WSMessage` from shared package
- TypeScript strict mode enabled across all packages
- Vite dev server proxies `/api` and `/ws` to `localhost:3001` (see `vite.config.ts`)
