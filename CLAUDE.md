# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**All Club** is a Turborepo monorepo for social club member management and facility booking. Three apps share one `packages/shared` library.

```
apps/
  api/      — Fastify 5 + Prisma 6 + PostgreSQL (port 3001)
  web/      — Next.js 14 App Router admin dashboard (port 3000)
  mobile/   — Expo 51 / React Native mobile app
packages/
  shared/   — Zod schemas + TypeScript types shared across all apps
  ui/       — Placeholder for shared React components (currently empty)
```

## Commands

### Root (Turbo orchestration)

```bash
npm run dev       # Start all apps in parallel watch mode
npm run build     # Build all apps (respects dependency order)
npm run lint      # tsc --noEmit across all packages
npm run format    # Prettier on all TS/TSX/JSON/MD files
```

### API (`apps/api`)

```bash
npm run dev           # tsx watch — hot reload
npm run build         # tsc → dist/
npm run start         # node dist/main.js
npm run lint          # tsc --noEmit
npm run test          # jest
npm run db:migrate    # prisma migrate dev
npm run db:studio     # Open Prisma Studio GUI
```

### Web (`apps/web`)

```bash
npm run dev    # next dev -p 3000
npm run build  # next build
npm run lint   # tsc --noEmit
```

### Mobile (`apps/mobile`)

```bash
npm run dev      # expo start
npm run ios      # expo run:ios
npm run android  # expo run:android
npm run lint     # tsc --noEmit
```

### Docker (full stack)

```bash
docker-compose up       # PostgreSQL (5433) + API (3001) + Web (3000)
```

API runs `prisma db push` automatically on container startup.

## Environment Variables

**`apps/api/.env`** (copy from `.env.example`):
```
DATABASE_URL="postgresql://allclub:allclub_secret@localhost:5433/allclub"
JWT_SECRET="..."
PORT=3001
```

**`apps/web/.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**`apps/mobile/.env`**:
```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Note: PostgreSQL runs on **5433** (not 5432) to avoid conflicts with local installs.

## Architecture

### API — Fastify module pattern

Each domain lives in `src/modules/{feature}/`:
- `{feature}.routes.ts` — Fastify route registration, input parsing with Zod
- `{feature}.service.ts` — Business logic, Prisma queries (service receives `PrismaClient` via constructor)

Prisma client is injected as a Fastify plugin decorator (`src/common/plugins/prisma.plugin.ts`).

Entry point is `src/main.ts` — registers plugins then imports all route modules.

### Web — Next.js App Router

- `app/(admin)/` — Protected admin route group
- `lib/api.ts` — Fetch wrapper; reads `NEXT_PUBLIC_API_URL`
- Minimal client components; logic stays in Server Components/pages

### Mobile — Expo Router tabs

Tab screens: `home`, `areas`, `bookings`, `profile`.  
Auth tokens stored via `expo-secure-store`.

### Shared package

`packages/shared/src/schemas/` exports Zod schemas. All apps import types via `z.infer<>` from these schemas — this is the API contract layer. Update schemas here when changing API shapes.

### Database schema (key models)

`Member` → `Area` → `AvailabilitySlot` → `Booking`  
- `Member` is self-referential: `holder` / `dependents` (TITULAR vs DEPENDENTE)
- `BlockedDate` prevents bookings on closed days
- Unique constraint on `(areaId, slotId, date)` prevents double-booking
- Enums use Portuguese values matching club terminology (e.g., `SEGUNDA`, `TERCA` for days)

## Code Conventions

**Formatting (Prettier):** no semicolons, single quotes, trailing commas, 100-char line width.

**Language:** Portuguese for domain identifiers (enums, Prisma model field names); English for file names and code structure.

**Validation:** All API inputs validated with Zod `.parse()`. Schemas live in `packages/shared`.

**Auth:** `@fastify/jwt` is registered but route-level guards are not yet enforced — this is a known gap to address when implementing protected endpoints.
