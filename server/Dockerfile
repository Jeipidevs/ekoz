# Multi-stage Dockerfile para o Backend Ekoz
FROM node:20-alpine AS build

WORKDIR /app

# Copiar dependências
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copiar código fonte e compilar
COPY tsconfig.json ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build

# Produção
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
