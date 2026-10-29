-- Migração de perfis legados para o novo padrão segregado:
-- ADMINISTRADOR, FINANCEIRO_VENDA, FINANCEIRO_ALUGUEL, CORRETOR_VENDA, CORRETOR_ALUGUEL

-- 1. Garante novos valores no enum Role
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FINANCEIRO_VENDA';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FINANCEIRO_ALUGUEL';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CORRETOR_VENDA';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CORRETOR_ALUGUEL';

-- 2. Migração de dados legados
UPDATE users SET role = 'ADMINISTRADOR' WHERE role::text = 'DIRETOR';
UPDATE users SET role = 'CORRETOR_VENDA' WHERE role::text IN ('GERENTE', 'CORRETOR');

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
