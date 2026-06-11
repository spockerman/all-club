# Stage 1: instalar dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
RUN npm ci --ignore-scripts

# Stage 2: build Next.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui
COPY apps/web ./apps/web
# NEXT_PUBLIC_* é embutido no bundle do client em build-time — precisa ser
# informado AGORA (não em runtime). No Railway, defina a variável
# NEXT_PUBLIC_API_URL no serviço: ela é injetada automaticamente como build arg.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# O .dockerignore exclui **/dist, então packages/shared/dist não é copiado:
# é preciso compilá-lo aqui antes da web (que importa seus tipos de ./dist).
RUN npm ci --ignore-scripts \
  && npm run build --workspace @all-club/shared \
  && npm run build --workspace @all-club/web

# Stage 3: imagem de produção
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
# next não é hoisted para a raiz — fica em apps/web/node_modules; copiar também.
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/packages/shared ./packages/shared
COPY apps/web/package.json ./apps/web/
COPY apps/web/next.config.js ./apps/web/
COPY package.json ./

WORKDIR /app/apps/web
# Sem EXPOSE: o Railway injeta $PORT e faz o roteamento; next start respeita $PORT.
CMD ["npm", "run", "start", "--workspace", "@all-club/web"]
