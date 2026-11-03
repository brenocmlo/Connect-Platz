-- prisma/02-migrate-data.sql
-- Passo 2: Atualiza dados legados após a confirmação dos novos enums no catálogo
UPDATE users SET role = 'ADMINISTRADOR' WHERE role::text = 'DIRETOR';
UPDATE users SET role = 'CORRETOR_VENDA' WHERE role::text IN ('GERENTE', 'CORRETOR');
UPDATE commission_splits SET "beneficiarioTipo" = 'PARCEIRO_EXTERNO' WHERE "beneficiarioTipo"::text = 'GERENTE';
