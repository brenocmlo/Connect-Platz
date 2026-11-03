#!/bin/sh
set -e

# Executa sincronização do schema Prisma se DATABASE_URL estiver presente
if [ -n "$DATABASE_URL" ]; then
  echo "🔁 Garantindo enums do PostgreSQL (Role, CommissionBeneficiaryType)..."
  prisma db execute --file prisma/01-ensure-enums.sql --schema prisma/schema.prisma || echo "⚠️ Enums já atualizados ou ignorados."

  echo "🔁 Migrando perfis legados (Diretor/Gerente) para Administrador/Corretor..."
  prisma db execute --file prisma/02-migrate-data.sql --schema prisma/schema.prisma || echo "⚠️ Migração de dados de perfis não aplicada. Continuando..."

  echo "📦 Sincronizando schema do banco de dados via Prisma..."
  prisma db push --skip-generate --accept-data-loss || echo "⚠️ Banco ainda não acessível ou sincronizado. Continuando inicialização..."
  
  if [ -f "prisma/seed.js" ] || [ -f "/app/prisma/seed.js" ]; then
    echo "🌱 Verificando e executando seed inicial de dados..."
    node prisma/seed.js || node /app/prisma/seed.js || echo "⚠️ Seed já aplicado ou ignorado."
  fi
fi

exec "$@"
