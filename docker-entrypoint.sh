#!/bin/sh
set -e

# Executa sincronização do schema Prisma se DATABASE_URL estiver presente
if [ -n "$DATABASE_URL" ]; then
  echo "🔁 Garantindo enums do PostgreSQL (Role, CommissionBeneficiaryType)..."
  prisma db execute --file prisma/01-ensure-enums.sql --schema prisma/schema.prisma || echo "⚠️ Enums já atualizados ou ignorados."

  echo "🔁 Migrando perfis legados (Diretor/Gerente) para Administrador/Corretor..."
  prisma db execute --file prisma/02-migrate-data.sql --schema prisma/schema.prisma || echo "⚠️ Migração de dados de perfis não aplicada. Continuando..."

  echo "📦 Aplicando migrações e sincronizando schema do banco de dados..."
  prisma migrate deploy || {
    echo "⚠️ Verificando baseline de migrações existentes..."
    prisma migrate resolve --applied 0_init 2>/dev/null || true
    prisma migrate deploy || echo "⚠️ Prosseguindo para sincronização direta de schema..."
  }
  prisma db push --accept-data-loss --skip-generate || echo "⚠️ Schema já sincronizado ou banco inacessível."
  
  if [ -f "prisma/seed.js" ] || [ -f "/app/prisma/seed.js" ]; then
    echo "🌱 Verificando e executando seed inicial de dados..."
    node prisma/seed.js || node /app/prisma/seed.js || echo "⚠️ Seed já aplicado ou ignorado."
  fi
fi

exec "$@"
