# SQR CLIMB

**How high can you go?**

SQR CLIMB is an original vertical pixel-art platformer for the SQR community. Players control a squirrel climbing endless procedural forest platforms. The primary competitive metric is **height reached**. There is one permanent community leaderboard — no seasons, no weekly resets.

## Features

- Real playable Canvas 2D game (not a mockup)
- Procedural platforms with reachable paths and rising difficulty
- Auto-jump + horizontal controls (keyboard + mobile touch)
- Collectibles (acorns) and hazards
- Username + EVM wallet + PIN auth (no wallet connect)
- Server-side anti-cheat run validation
- Permanent all-time leaderboard with personal rank
- Admin dashboard for stats, run moderation, and rewards tracking
- Mobile-first responsive UI

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS**
- **Prisma** + PostgreSQL
- **jose** (JWT sessions) + **bcryptjs** (PIN hashing)
- **Zod** validation
- Custom Canvas 2D game engine (no Phaser)

## Project Structure

```
src/
  app/           # Pages + API routes
    page.tsx     # Landing
    play/        # Game
    leaderboard/
    login/
    register/
    admin/
    api/         # auth, game, leaderboard, admin
  components/    # Navbar, Footer, GameCanvas
  game/          # Engine + types
  lib/           # auth, prisma, anticheat, validation, constants
prisma/
  schema.prisma
```

## Environment Variables

Copy `.env.example` to `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/sqrclimb?sslmode=require"
SESSION_SECRET="generate-with-openssl-rand-base64-32"
ADMIN_SECRET="your-admin-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Never commit real secrets.

## Setup

```bash
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (or use migrate)
npx prisma db push
# OR
npx prisma migrate dev --name init

# Development
npm run dev

# Production build
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | `prisma generate` + production build |
| `npm start` | Start production server |
| `npm run lint` | Next.js lint |
| `npm run db:push` | Push Prisma schema |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Prisma Studio |

## Main Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/play` | SQR Climb game |
| `/leaderboard` | Permanent leaderboard |
| `/login` | Login (username + PIN) |
| `/register` | Register (username + wallet + PIN) |
| `/admin` | Admin dashboard (ADMIN_SECRET) |

## API

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current session
- `POST /api/game/start` — start a run (auth required)
- `POST /api/game/submit` — submit run with server validation
- `GET /api/leaderboard` — paginated leaderboard + personal rank
- `GET /api/admin/stats` — admin stats (`x-admin-secret` header)
- `GET/PATCH /api/admin/runs` — list / moderate runs

## Authentication

- Username + PIN (hashed with bcrypt)
- EVM wallet address stored at registration only (normalized, unique)
- No MetaMask / WalletConnect — paste address only
- HTTP-only secure cookie sessions backed by database `Session` rows
- JWT signed with `SESSION_SECRET`

## Database Models

- **User** — username, wallet, pinHash, bestHeight, status, isAdmin
- **Session** — token, expiresAt
- **GameRun** — height, duration, acorns, status (PENDING/VALIDATED/FLAGGED/REJECTED), validation metadata
- **Reward** — rank, amount, wallet, status, transactionHash
- **RewardConfig** — rank → amount mapping
- **AdminLog** — audit actions

## Game Architecture

- Canvas 2D loop in `src/game/engine.ts`
- Procedural platforms (normal, moving, bouncy, breakable)
- Physics: gravity, jump, horizontal acceleration
- Camera follows player upward
- Original pixel-style drawing (no external copyrighted assets)
- Mobile: large left/right touch buttons
- Desktop: Arrow keys / A D

## Anti-Cheat

Runs are **not** trusted from the client alone.

1. Client starts a run → server creates `PENDING` GameRun
2. On death, client submits height + duration + stats
3. Server validates:
   - Duration bounds
   - Height vs time plausibility
   - Hard height cap
   - Density / jump heuristics
4. Status set to `VALIDATED`, `FLAGGED`, or `REJECTED`
5. Personal best only updates on `VALIDATED` runs
6. Admin can approve/reject flagged runs

## Admin

1. Set `ADMIN_SECRET` in environment
2. Open `/admin`
3. Enter the secret
4. View stats, moderate runs, see top players

Optionally set `isAdmin: true` on a User in the database for session-based admin access.

## Deployment (Vercel)

1. Connect the GitHub repo to Vercel
2. Add environment variables (`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_SECRET`)
3. Use a hosted PostgreSQL (Neon, Supabase, Railway, Vercel Postgres)
4. Deploy — `npm run build` runs `prisma generate && next build`
5. Run `npx prisma db push` (or migrate) against the production DB once

## License / Disclaimer

Community project for SQR. Not financial advice. Play for fun. Climb for glory.
