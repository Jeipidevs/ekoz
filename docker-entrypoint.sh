#!/bin/sh

echo "🏛️ ==========================================="
echo "🚀 INICIANDO EKOZ ECOSYSTEM FULL-STACK..."
echo "🏛️ ==========================================="

cd /app/server

# Sincronizar schema Prisma com o Postgres (idempotente — não apaga dados).
# Timeout de 60s: se o banco não responder, sobe o app mesmo assim em vez de
# travar o container inteiro (uma migration pendente não deve derrubar o site).
echo "🗄️  Sincronizando schema Prisma com o banco..."
timeout 60 npx prisma db push --skip-generate || echo "⚠️  prisma db push falhou ou expirou — subindo o app mesmo assim"

# Iniciar Node API em background
echo "🚀 Iniciando Backend API Node.js (Porta 3001)..."
node dist/index.js &

# Aguardar 2 segundos para o Node inicializar
sleep 2

# Iniciar Nginx na porta 80 em foreground
echo "🌐 Iniciando Servidor Web Nginx (Porta 80)..."
exec nginx -g "daemon off;"
