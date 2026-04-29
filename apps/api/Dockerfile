# Stage 1: instalar dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Copiar todos os package.json dos workspaces para que npm ci resolva corretamente
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
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
RUN cd packages/shared && npx tsc && \
    cd /app/apps/api && \
    DATABASE_URL="postgresql://x:x@localhost:5432/x" npx prisma generate && \
    npx tsc

# Stage 3: imagem de produção
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/shared ./packages/shared
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma.config.ts ./apps/api/
COPY package.json ./

WORKDIR /app/apps/api
EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
