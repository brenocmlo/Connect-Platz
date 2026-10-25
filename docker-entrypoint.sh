#!/bin/sh
set -e

# Executa sincronização do schema Prisma se DATABASE_URL estiver presente
if [ -n "$DATABASE_URL" ]; then
  echo "🔁 Migrando perfis legados (Diretor/Gerente) para Administrador/Corretor..."
  prisma db execute --file prisma/migrate-perfis.sql --schema prisma/schema.prisma || echo "⚠️ Migração de perfis não aplicada. Continuando..."

  echo "📦 Sincronizando schema do banco de dados via Prisma..."
  prisma db push --skip-generate --accept-data-loss || echo "⚠️ Banco ainda não acessível ou sincronizado. Continuando inicialização..."
  
  if [ -f "prisma/seed.js" ] || [ -f "/app/prisma/seed.js" ]; then
    echo "🌱 Verificando e executando seed inicial de dados..."
    node prisma/seed.js || node /app/prisma/seed.js || echo "⚠️ Seed já aplicado ou ignorado."
  fi
fi

exec "$@"
