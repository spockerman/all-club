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

#### Component structure (`apps/web/components/`)

```
components/
  ui/               — Generic, domain-agnostic UI primitives (use these in all new pages)
    breadcrumb.tsx          — Hierarchical nav with ← back link and <h1> as last segment
    detail-card.tsx         — White card wrapper (DetailCard) + label/value row (DetailField)
    modal.tsx               — Overlay dialog — 'use client', sizes: sm | md | lg
    page-header.tsx         — Page title + optional subtitle + optional action slot
    primary-navigate-button.tsx — router.push() button wrapper
    status-badge.tsx        — Colored pill badge, variants: green | yellow | gray | red
  members/          — Domain components for the members feature
  dashboard/        — Domain components for the dashboard feature
  admin/            — Shell layout (AdminAppShell)
```

#### Domain label files (`apps/web/lib/`)

```
lib/
  member-labels.ts   — CATEGORY_LABEL, STATUS_LABEL, MEMBER_STATUS_VARIANT
  booking-labels.ts  — BOOKING_STATUS_LABEL, BOOKING_STATUS_VARIANT
  agenda-labels.ts   — PERIOD_LABEL, AGENDA_STATUS_LABEL/VARIANT, SCHEDULE_LOG_STATUS_LABEL/VARIANT, TRIGGER_TYPE_LABEL
```

Each domain has a `*_STATUS_VARIANT` map that resolves a status enum value to a `StatusBadge` variant string (`green | yellow | gray | red`). Add a new `*-labels.ts` when introducing a new domain with status enums.

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

**Agenda domain** (all DDL in English):

`Area` → `Agenda` → `AgendaReservation` ← `Member`  
`Area` → `ScheduleConfig` → `ScheduleLog`

- `Agenda`: unique on `(areaId, date, period)` — prevents duplicate slots
- `ALL_DAY` conflicts with any partial period (MORNING/AFTERNOON/EVENING) on same area+date — enforced at service layer in `agendas.conflicts.ts`
- `AgendaReservation`: `agendaId @unique` — one reservation per agenda slot
- `ScheduleConfig`: cron job config per area+period; `active` flag controls job registration
- `ScheduleLog`: immutable audit trail; `status` is SUCCESS / FAILURE / PARTIAL
- Scheduler plugin (`src/common/plugins/scheduler.plugin.ts`) loads all active configs on boot; exposes `app.scheduler.{register, unregister, reload}`
- timezone: `America/Sao_Paulo` throughout the scheduler

## Code Conventions

**Formatting (Prettier):** no semicolons, single quotes, trailing commas, 100-char line width.

**Language:** English for all DDL (model names, field names, enum names and values, index names). Existing Portuguese enum values (`TITULAR`, `CONFIRMADO`, etc.) are legacy and should not be changed. All new schema elements must use English.

**UI/domain labels:** Portuguese strings live in `lib/*-labels.ts` as display maps — never in the schema itself.

**Validation:** All API inputs validated with Zod `.parse()`. Schemas live in `packages/shared`.

**Auth:** `@fastify/jwt` is registered but route-level guards are not yet enforced — this is a known gap to address when implementing protected endpoints.

## Web UI Patterns

### Page layout rules

Every admin page falls into one of two layout patterns — choose based on context:

**Listing pages** (index, `/members`, `/areas`, `/bookings`):
```tsx
<PageHeader title="..." subtitle="..." action={<PrimaryNavigateButton href="...">...</PrimaryNavigateButton>} />
{/* table or grid */}
```

**Detail / edit pages** (show, new, edit):
```tsx
<Breadcrumb segments={[
  { label: 'Parent label', href: '/parent' },
  { label: 'Optional middle', href: '/parent/id' }, // omit if not needed
  { label: 'Current page title' },                  // last segment = <h1>
]} />
{/* content */}
```

### Status badges

Never inline `<span>` with status colors. Always use `<StatusBadge>`:
```tsx
import { StatusBadge } from '@/components/ui/status-badge'
import { STATUS_LABEL, MEMBER_STATUS_VARIANT } from '@/lib/member-labels'

<StatusBadge label={STATUS_LABEL[item.status]} variant={MEMBER_STATUS_VARIANT[item.status]} />
```

Variants: `green` (active/confirmed), `yellow` (suspended/warning), `gray` (inactive/expired/pending), `red` (cancelled/error).

### Modals

Use `<Modal>` for any overlay dialog. Never replicate the overlay div inline:
```tsx
import { Modal } from '@/components/ui/modal'

{open && (
  <Modal title="..." size="sm|md|lg" scrollable onClose={() => setOpen(false)}>
    {/* content */}
  </Modal>
)}
```

- `size="sm"` — confirmation dialogs (max-w-sm)
- `size="md"` — default forms (max-w-lg)
- `size="lg"` — wide forms or multi-column content (max-w-xl)
- `scrollable` — add when the modal content may overflow vertically (e.g. long forms)

### Detail cards

Use `<DetailCard>` + `<DetailField>` for key/value info sections:
```tsx
import { DetailCard, DetailField } from '@/components/ui/detail-card'

<DetailCard>
  <DetailField label="E-mail" value={item.email} />
  <DetailField label="Status" value={<StatusBadge ... />} />
</DetailCard>
```

`DetailField.value` accepts `ReactNode`, so badges, links, and formatted values all work.

### CRUD pattern — standard for all admin screens

All create/edit/delete interactions happen via modals, without page navigation. This is the enforced pattern for every CRUD in the system.

**The table Client Component owns all modal state:**

```tsx
// components/{feature}/{feature}s-table.tsx  ('use client')
const [showNew, setShowNew]       = useState(false)
const [editTarget, setEditTarget] = useState<Item | null>(null)
const [deleteTarget, ...]         = useState<Item | null>(null)

// Single click → edit modal
// Double click → delete confirmation modal (250 ms timer)
```

**New record button lives inside the table component, not in PageHeader:**

```tsx
<div className="flex justify-end mb-4">
  <button onClick={() => setShowNew(true)} className={primaryButtonClassName}>
    + Novo …
  </button>
</div>
```

**All three modals follow the same shape:**

```tsx
// Create
{showNew && (
  <Modal title="Novo …" size="md" scrollable onClose={() => setShowNew(false)}>
    <FeatureForm mode="create" onSuccess={() => setShowNew(false)} submitLabel="Cadastrar" hideCancel />
  </Modal>
)}

// Edit (single click)
{editTarget && (
  <Modal title="Editar …" size="md" scrollable onClose={() => setEditTarget(null)}>
    <FeatureForm mode="edit" item={editTarget} onSuccess={() => setEditTarget(null)} submitLabel="Salvar" hideCancel />
  </Modal>
)}

// Delete (double click)
{deleteTarget && (
  <Modal title="Excluir …" size="sm" onClose={() => { if (!deleteLoading) setDeleteTarget(null) }}>
    {/* confirmation + Cancelar / Excluir buttons */}
  </Modal>
)}
```

**Form component props (standard interface for every domain form):**

```tsx
type Props = {
  mode: 'create' | 'edit'
  item?: DomainType          // required when mode === 'edit'
  onSuccess?: () => void     // when provided: close modal + router.refresh(); else: router.push to detail
  onCancel?: () => void      // when provided: close modal; else: router.back()
  submitLabel?: string       // overrides default label ("Cadastrar" / "Salvar alterações")
  hideCancel?: boolean       // hides cancel button and centers submit (used in modals)
}
```

**Page Server Component stays thin — title + data fetch only:**

```tsx
// app/(admin)/{feature}/page.tsx  (Server Component)
export default async function FeaturePage() {
  const items = await api.get('/feature').catch(() => [])
  return (
    <div>
      <PageHeader title="…" subtitle={`Total: ${items.length}`} />
      <FeatureTable items={items} />   {/* no action= prop */}
    </div>
  )
}
```

**`/new` and `/[id]/edit` pages still exist** for direct URL access, but the primary flow is modal-based.

**Tab switcher in modals:** When a create modal has multiple creation modes (e.g., individual vs. batch), use a pill-style tab switcher at the top of the modal body:
```tsx
<div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-5">
  {tabs.map((tab) => (
    <button key={tab} type="button" onClick={() => setTab(tab)}
      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
        activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}>{label}</button>
  ))}
</div>
```

### Adding a new domain (feature)

1. Create `app/(admin)/{feature}/page.tsx` — Server Component, `PageHeader` without `action`
2. Create `app/(admin)/{feature}/[id]/page.tsx` — Server Component, `Breadcrumb` + `DetailCard` + Editar button
3. Create `app/(admin)/{feature}/new/page.tsx` and `[id]/edit/page.tsx` — `Breadcrumb` + form (fallback for direct URL access)
4. Create `components/{feature}/{feature}-form.tsx` — Client Component following the standard Props interface above
5. Create `components/{feature}/{feature}s-table.tsx` — Client Component owning all modal state + new/edit/delete flow
6. Create `lib/{feature}-labels.ts` with `*_LABEL` and `*_STATUS_VARIANT` maps if the domain has status enums
7. Register the route in `AdminAppShell` sidebar navigation
