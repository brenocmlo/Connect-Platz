// lib/db/ensureEnums.ts
// Garante idempotentemente que todos os valores de enums requeridos pelo Prisma
// (ex.: novos perfis segregados Role e CommissionBeneficiaryType) existam no PostgreSQL
// sem travar a inicialização do sistema ou quebrar consultas em produção.

import { prisma } from "@/lib/db/prisma";

export async function ensureDatabaseEnums() {
  try {
    // 1. Garante novos valores do enum "Role" individualmente
    // No PostgreSQL, cada 'ALTER TYPE ... ADD VALUE' precisa ser executado de forma autônoma
    const requiredRoles = [
      "ADMINISTRADOR",
      "FINANCEIRO_VENDA",
      "FINANCEIRO_ALUGUEL",
      "CORRETOR_VENDA",
      "CORRETOR_ALUGUEL",
    ];

    for (const role of requiredRoles) {
      await prisma
        .$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS '${role}'`)
        .catch(() => {
          // Ignora caso o enum ou valor já exista
        });
    }

    // 2. Garante novos valores do enum "CommissionBeneficiaryType"
    const beneficiaryTypes = ["SOCIO_GESTOR", "PARCEIRO_EXTERNO"];
    for (const type of beneficiaryTypes) {
      await prisma
        .$executeRawUnsafe(`ALTER TYPE "CommissionBeneficiaryType" ADD VALUE IF NOT EXISTS '${type}'`)
        .catch(() => {});
    }

    // 3. Migração de dados legados (somente se a tabela users existir)
    await prisma
      .$executeRawUnsafe(`UPDATE users SET role = 'ADMINISTRADOR' WHERE role::text = 'DIRETOR'`)
      .catch(() => {});
    await prisma
      .$executeRawUnsafe(`UPDATE users SET role = 'CORRETOR_VENDA' WHERE role::text IN ('GERENTE', 'CORRETOR')`)
      .catch(() => {});
    await prisma
      .$executeRawUnsafe(
        `UPDATE commission_splits SET "beneficiarioTipo" = 'PARCEIRO_EXTERNO' WHERE "beneficiarioTipo"::text = 'GERENTE'`
      )
      .catch(() => {});

    console.log("[DB_INIT] Enums e perfis do PostgreSQL verificados com sucesso.");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[DB_INIT] Aviso ao verificar enums do banco:", msg);
  }
}
