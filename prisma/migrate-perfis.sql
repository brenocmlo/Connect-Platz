-- Migração de perfis: o sistema passa a ter apenas ADMINISTRADOR e CORRETOR.
-- Idempotente: pode rodar a cada deploy (docker-entrypoint.sh) antes do `prisma db push`.
--   DIRETOR  -> ADMINISTRADOR (mesmas permissões)
--   GERENTE  -> CORRETOR      (menor privilégio)
--   Split "Gestor / Sócio": CommissionBeneficiaryType DIRETOR renomeado para SOCIO_GESTOR
--   Split de Gerente (removido): passa a PARCEIRO_EXTERNO, preservando nome e valor

UPDATE users SET role = 'ADMINISTRADOR' WHERE role::text = 'DIRETOR';
UPDATE users SET role = 'CORRETOR' WHERE role::text = 'GERENTE';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'CommissionBeneficiaryType' AND e.enumlabel = 'DIRETOR'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'CommissionBeneficiaryType' AND e.enumlabel = 'SOCIO_GESTOR'
  ) THEN
    ALTER TYPE "CommissionBeneficiaryType" RENAME VALUE 'DIRETOR' TO 'SOCIO_GESTOR';
  END IF;
END $$;

UPDATE commission_splits SET "beneficiarioTipo" = 'PARCEIRO_EXTERNO' WHERE "beneficiarioTipo"::text = 'GERENTE';
