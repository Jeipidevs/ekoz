#!/bin/sh

echo "🏛️ ==========================================="
echo "🚀 INICIANDO EKOZ ECOSYSTEM (FULL-STACK)..."
echo "🏛️ ==========================================="

cd /app/server

# Iniciar Node API em background
echo "🚀 Iniciando Backend API Node.js (Porta 3001)..."
node dist/index.js > /tmp/ekoz-backend.log 2>&1 &

# Iniciar Nginx na porta 80 em foreground
echo "🌐 Iniciando Servidor Web Nginx (Porta 80)..."
exec nginx -g "daemon off;"
