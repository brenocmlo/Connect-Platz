#!/bin/sh
set -e

# Executa sincronização do schema Prisma se DATABASE_URL estiver presente
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Sincronizando schema do banco de dados via Prisma..."
  prisma db push --skip-generate --accept-data-loss || echo "⚠️ Banco ainda não acessível ou sincronizado. Continuando inicialização..."
fi

exec "$@"
