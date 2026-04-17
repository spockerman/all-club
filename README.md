# All Club

Sistema de gestão para clubes sociais — controle de sócios, reservas de áreas, agendas e usuários administrativos.

## Visão Geral

Monorepo [Turborepo](https://turbo.build/) com três aplicações que compartilham um pacote de tipos e schemas:

```
apps/
  api/      — API REST  (Fastify 5 · Prisma 6 · PostgreSQL)      porta 3001
  web/      — Painel administrativo (Next.js 14 App Router)       porta 3000
  mobile/   — App do sócio (Expo 51 · React Native)              porta Expo
packages/
  shared/   — Schemas Zod + tipos TypeScript compartilhados
  ui/        — Componentes React compartilhados (placeholder)
```

---

## Requisitos

| Ferramenta | Versão mínima |
|------------|--------------|
| Node.js    | 20           |
| npm        | 10           |
| Docker + Docker Compose | qualquer versão recente |
| PostgreSQL  | 16 (via Docker) |

---

## Início Rápido

### Opção A — Docker (stack completa)

```bash
docker-compose up
```

Sobe PostgreSQL (5433), API (3001) e Web (3000). A API executa `prisma db push` automaticamente na inicialização do container.

### Opção B — Desenvolvimento local

**1. Instalar dependências**
```bash
npm install
```

**2. Configurar variáveis de ambiente**

```bash
# apps/api/.env
DATABASE_URL="postgresql://allclub:allclub_secret@localhost:5433/allclub"
JWT_SECRET="sua-chave-secreta-com-pelo-menos-32-caracteres"
PORT=3001

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

**3. Subir o banco de dados**
```bash
docker-compose up postgres
```

**4. Aplicar as migrations e popular o banco**
```bash
cd apps/api
npm run db:migrate   # aplica todas as migrations
npm run db:seed      # cria as 20 permissões + admin padrão
```

**5. Iniciar todas as apps**
```bash
# na raiz do monorepo
npm run dev
```

### Credenciais padrão

Após executar o seed:

| Campo  | Valor                  |
|--------|------------------------|
| E-mail | `admin@clube.com`      |
| Senha  | `Admin@123`            |
| Role   | ADMIN                  |

> O admin padrão é criado com `mustChangePassword = true`. Você será redirecionado para a tela de troca de senha no primeiro acesso.

---

## Comandos

### Raiz (Turbo)

```bash
npm run dev      # inicia todas as apps em modo watch paralelo
npm run build    # build de todas as apps (respeita ordem de dependências)
npm run lint     # tsc --noEmit em todos os pacotes
npm run format   # Prettier em todos os arquivos TS/TSX/JSON/MD
```

### API (`apps/api`)

```bash
npm run dev           # tsx watch — hot reload
npm run build         # tsc → dist/
npm run start         # node dist/main.js
npm run lint          # tsc --noEmit
npm run test          # jest
npm run db:migrate    # prisma migrate dev
npm run db:studio     # abre o Prisma Studio no navegador
npm run db:seed       # seed: 20 permissões + admin padrão
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

---

## Arquitetura

### API — padrão de módulos Fastify

Cada domínio vive em `src/modules/{feature}/`:

```
src/
  modules/
    auth/              — Login, logout, refresh, troca de senha, reset
    users/             — Gerenciamento de usuários internos e sócios
    access-profiles/   — Perfis de acesso com permissões granulares
    permissions/       — Listagem de permissões disponíveis
    members/           — CRUD de sócios (titular, dependente, convidado)
    areas/             — Áreas do clube com slots de disponibilidade
    agendas/           — Slots de agenda e reservas
    schedule-configs/  — Configurações de geração automática (cron)
    schedule-logs/     — Logs de execução das rotinas
    bookings/          — Agendamentos legados
  common/
    hooks/             — authenticate, requirePermission, requireRole
    plugins/           — prisma.plugin, scheduler.plugin
    utils/             — password.utils, token.utils
```

- `{feature}.routes.ts` — registro de rotas Fastify, parsing de input com Zod
- `{feature}.service.ts` — lógica de negócio e queries Prisma (injetado via construtor)
- Prisma client injetado como plugin decorator em `prisma.plugin.ts`
- Documentação OpenAPI disponível em `http://localhost:3001/docs`

### Web — Next.js App Router

```
app/
  login/              — Página de login (público)
  change-password/    — Troca de senha obrigatória (público)
  (admin)/            — Grupo protegido por middleware.ts
    dashboard/
    members/
    areas/
    agendas/
    schedule-configs/
    schedule-logs/
    bookings/
    users/
    access-profiles/
components/
  ui/                 — Primitivos reutilizáveis (Modal, StatusBadge, Breadcrumb…)
  admin/              — Shell do painel (AdminAppShell)
  members/ areas/ agendas/ users/ access-profiles/ …
lib/
  api.ts              — Fetch wrapper com injeção automática do token JWT
  *-labels.ts         — Mapas de label/variante por domínio
middleware.ts         — Redireciona não autenticados para /login
```

### Mobile — Expo Router (tabs)

Telas: `home`, `areas`, `bookings`, `profile`. Tokens armazenados via `expo-secure-store`.

### Shared package

`packages/shared/src/schemas/` exporta schemas Zod. Todos os apps importam tipos via `z.infer<>` — é a camada de contrato de API.

---

## Banco de Dados

### Domínio de sócios e reservas

```
Member ──► Area ──► AvailabilitySlot ──► Booking
Member ──► AgendaReservation ◄── Agenda ◄── Area
Area ──► ScheduleConfig ──► ScheduleLog
```

- `Member` é auto-referencial: titular → dependentes
- `BlockedDate` bloqueia datas específicas por área
- `Agenda`: único em `(areaId, date, period)` — sem slots duplicados
- `AgendaReservation`: `agendaId @unique` — uma reserva por slot
- `ScheduleConfig`: configuração de cron por área+período; flag `active` controla o registro do job
- Período `ALL_DAY` conflita com qualquer período parcial na mesma área+data — regra aplicada na camada de serviço

### Domínio de autenticação e autorização

```
User ──► UserCredential
User ──► RefreshToken
User ──► UserAccessProfile ──► AccessProfile ──► AccessProfilePermission ──► Permission
User ──► SecurityAuditLog
Member ◄── User (1:1 opcional)
```

---

## Autenticação e Autorização

### Estratégia

- **JWT** com expiração de 30 minutos; array de permissões embutido no payload (sem consulta ao banco por requisição)
- **Refresh token**: UUID opaco armazenado na tabela `RefreshToken`; expira em 30 dias; invalidado se emitido antes de `passwordChangedAt`
- **Cookie `access_token`** (non-httpOnly): legível tanto em Server Components (`cookies()`) quanto em Client Components (`document.cookie`)
- **`localStorage` `refresh_token`**: gerenciado pelo cliente para renovação do token

### Roles

| Role | Contexto | Verificação |
|------|---------|-------------|
| `ADMIN` | Acesso total ao sistema | Ignora todas as verificações de permissão |
| `EMPLOYEE` | Painel administrativo | União de permissões dos `AccessProfile` ativos atribuídos ao usuário |
| `MEMBER` | App mobile | Fixo: `agenda:view`, `booking:view`, `booking:create`, `booking:cancel`, `area:view` |

### Permissões disponíveis (20)

| Recurso | Ações |
|---------|-------|
| `member` | `view`, `create`, `edit`, `deactivate` |
| `area` | `view`, `create`, `edit`, `delete` |
| `agenda` | `view`, `create`, `edit`, `delete` |
| `booking` | `view`, `create`, `cancel` |
| `schedule-config` | `manage` |
| `user` | `view`, `create`, `deactivate` |
| `access-profile` | `view` |

### Hooks Fastify

```typescript
// Verifica JWT
authenticate

// Verifica permissão (ADMIN ignora)
requirePermission('member:view')
requirePermission('member:view', 'member:edit')  // lógica OR

// Verifica role
requireRole('ADMIN')
requireRole('ADMIN', 'EMPLOYEE')  // lógica OR
```

### Segurança

- **Proteção contra timing attack**: `DUMMY_HASH` inicializado no startup; `bcrypt.compare` sempre é executado mesmo quando o usuário não existe
- **Bloqueio de conta**: 5 tentativas falhas → status `BLOCKED` + `lockedUntil = agora + 30min`
- **Política de senha**: mínimo 8 caracteres, pelo menos uma maiúscula, uma minúscula e um dígito
- **Hash de senha**: `bcryptjs` (puro JS, compatível com ESM), fator de custo 12

---

## Módulos da API

| Prefixo | Endpoints principais |
|---------|---------------------|
| `/auth` | POST /login, /logout, /refresh · GET /me · PATCH /me, /me/password · POST /forgot-password, /reset-password |
| `/members` | CRUD + PATCH /deactivate · GET /search |
| `/areas` | CRUD + slots de disponibilidade + datas bloqueadas + disponibilidade |
| `/agendas` | CRUD + POST /:id/reservations · DELETE /:id/reservations |
| `/schedule-configs` | CRUD + PATCH /:id/toggle + POST /:id/run |
| `/schedule-logs` | GET (filtros: configId, status, trigger) |
| `/users` | GET, GET/:id · POST /internal, /member · PATCH /:id/activate\|deactivate\|block\|unblock · PUT /:id/profiles |
| `/access-profiles` | CRUD + PUT /:id/permissions + PATCH /:id/toggle |
| `/permissions` | GET (somente ADMIN) |
| `/health` | GET — health check público |

---

## Convenções de Código

- **Formatação (Prettier):** sem ponto e vírgula, aspas simples, trailing commas, 100 colunas
- **DDL em inglês:** nomes de modelos, campos, enums e índices em inglês. Valores de enums portugueses existentes (`TITULAR`, `CONFIRMADO`, etc.) são legados e não devem ser alterados
- **Labels de UI em português:** strings de exibição vivem em `lib/*-labels.ts` — nunca no schema
- **Validação:** todos os inputs da API são validados com Zod `.parse()`. Schemas em `packages/shared`
- **Rotas protegidas:** todas as rotas usam `authenticate` + `requirePermission`/`requireRole`
