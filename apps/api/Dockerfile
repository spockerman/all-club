# Stage 1: instalar dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN npm ci --ignore-scripts

# Stage 2: gerar Prisma client e compilar TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/api ./apps/api
RUN cd apps/api && npx prisma generate && npx tsc

# Stage 3: imagem de produção
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/shared ./packages/shared
COPY apps/api/package.json ./apps/api/
COPY package.json ./

WORKDIR /app/apps/api
EXPOSE 3001

# Aplica migrações versionadas e inicia a API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
