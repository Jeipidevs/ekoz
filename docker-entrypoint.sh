#!/bin/sh
set -e

echo "🏛️ ==========================================="
echo "🚀 INICIANDO CONTAINER FULL-STACK EKOZ..."
echo "🏛️ ==========================================="

cd /app/server

# Inicializar banco de dados SQLite caso ainda não exista
if [ ! -f "prisma/dev.db" ]; then
    echo "📦 Inicializando banco de dados relacional e aplicando seeds oficiais..."
    npx prisma db push --skip-generate
    npx tsx prisma/seed.ts
else
    echo "✅ Banco de dados existente encontrado."
fi

echo "🚀 Iniciando Backend API Node.js (Porta 3001)..."
node dist/index.js &

# Aguardar API subir
sleep 2

echo "🌐 Iniciando Servidor Web Nginx (Porta 80)..."
nginx -g "daemon off;"
