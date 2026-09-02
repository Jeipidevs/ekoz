# ==========================================
# 1. Build do Frontend React 19 (Vite)
# ==========================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY package*.json ./
RUN npm install

COPY tsconfig*.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src

RUN npm run build

# ==========================================
# 2. Build do Backend Node.js (TypeScript + Prisma)
# ==========================================
FROM node:20-alpine AS backend-build
WORKDIR /app/server

COPY server/package*.json ./
COPY server/prisma ./prisma/

RUN npm install

COPY server/tsconfig.json ./
COPY server/src ./src/

# DATABASE_URL/DIRECT_URL reais só existem em runtime (injetadas pelo EasyPanel);
# aqui são só placeholders para o `prisma generate` resolver env() no schema —
# ele não abre conexão com o banco.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/ekoz_db"
ENV DIRECT_URL="postgresql://user:password@localhost:5432/ekoz_db"
RUN npx prisma generate
RUN npm run build

# ==========================================
# 3. Runtime Unificado de Produção (Nginx + Node 20)
# ==========================================
FROM node:20-alpine AS runner

# Instalar Nginx no Alpine
RUN apk update && apk add --no-cache nginx

# Configuração do Nginx (Alpine inclui http.d dentro do bloco http{}; conf.d é
# incluído fora dele, então um bloco server{} ali quebra o nginx -t)
RUN mkdir -p /run/nginx /usr/share/nginx/html /var/log/nginx /etc/nginx/http.d
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copiar Frontend compilado
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Configurar Backend
WORKDIR /app/server
ENV NODE_ENV=production
ENV INTERNAL_PORT=3001
# DATABASE_URL/DIRECT_URL reais são injetadas pelo EasyPanel via variáveis de ambiente do serviço
ENV DATABASE_URL="postgresql://user:password@localhost:5432/ekoz_db"
ENV DIRECT_URL="postgresql://user:password@localhost:5432/ekoz_db"

COPY server/package*.json ./
COPY server/prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate

# Copiar build (sem banco pré-semeado — o schema é sincronizado com o Postgres
# real em runtime pelo docker-entrypoint.sh)
COPY --from=backend-build /app/server/dist ./dist

# Script de entrada
WORKDIR /app
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 80

CMD ["/app/docker-entrypoint.sh"]
