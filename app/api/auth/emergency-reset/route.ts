// app/api/auth/emergency-reset/route.ts
// Redefinição emergencial de senha:
// 1. Painel Administrativo (Admin resetando senha de colaborador com senha temporária)
// 2. Fluxo Público na Tela de Login (Solicitação de código emergencial + validação com troca)

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getRequestSession, isAdmin } from "@/lib/auth/session";
import { recordAudit } from "@/lib/services/audit-server";

export const dynamic = "force-dynamic";

function generateSecureTempPassword(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const specials = "@#$%&*";
  let pwd = "Platz";
  for (let i = 0; i < 4; i++) {
    pwd += letters.charAt(crypto.randomInt(0, letters.length));
  }
  for (let i = 0; i < 3; i++) {
    pwd += numbers.charAt(crypto.randomInt(0, numbers.length));
  }
  pwd += specials.charAt(crypto.randomInt(0, specials.length));
  return pwd;
}

function generateNumericCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, targetUserId, newPassword, email, code } = body;

    // ------------------------------------------------------------------------
    // MODO 1: ADMINISTRADOR RESETANDO SENHA DE COLABORADOR (AUTENTICADO)
    // ------------------------------------------------------------------------
    const session = getRequestSession(req);
    if (session && isAdmin(session.role) && targetUserId) {
      const targetUser = await prisma.user.findFirst({
        where: { id: targetUserId, organizationId: session.organizationId },
        select: { id: true, nome: true, email: true, role: true },
      });

      if (!targetUser) {
        return NextResponse.json({ error: "Colaborador não encontrado." }, { status: 404 });
      }

      const generatedPassword = newPassword?.trim() ? newPassword.trim() : generateSecureTempPassword();
      if (generatedPassword.length < 8) {
        return NextResponse.json({ error: "A senha deve conter no mínimo 8 caracteres." }, { status: 400 });
      }

      const passwordHash = await hashPassword(generatedPassword);

      await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          passwordHash,
          emergencyResetToken: null,
          emergencyResetExpiresAt: null,
        },
      });

      await recordAudit({
        req,
        organizationId: session.organizationId,
        userId: session.userId,
        acao: "Redefinição Emergencial de Senha",
        tipoAcao: "UPDATE",
        modulo: "AUTENTICACAO",
        entidade: "User",
        entidadeId: targetUser.id,
        entidadeNome: targetUser.nome,
        descricao: `${session.nome} efetuou a redefinição emergencial de senha para ${targetUser.nome} (${targetUser.email}).`,
      });

      return NextResponse.json({
        success: true,
        temporaryPassword: generatedPassword,
        message: `Senha de ${targetUser.nome} redefinida com sucesso.`,
      });
    }

    // ------------------------------------------------------------------------
    // MODO 2: FLUXO PÚBLICO (TELA DE LOGIN - ESQUECI MINHA SENHA)
    // ------------------------------------------------------------------------

    // Ação 2.1: Solicitar Código Emergencial
    if (action === "request") {
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        select: { id: true, nome: true, email: true, organizationId: true },
      });

      // Proteção de enumeração: sempre responde mensagem amigável
      if (!user) {
        return NextResponse.json({
          success: true,
          message: "Se o e-mail estiver cadastrado, a chave emergencial foi gerada.",
        });
      }

      const emergencyCode = generateNumericCode();
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emergencyResetToken: emergencyCode,
          emergencyResetExpiresAt: expiresAt,
        },
      });

      await recordAudit({
        req,
        organizationId: user.organizationId,
        userId: user.id,
        acao: "Solicitou Redefinição Emergencial",
        tipoAcao: "STATUS_CHANGE",
        modulo: "AUTENTICACAO",
        entidade: "User",
        entidadeId: user.id,
        entidadeNome: user.nome,
        descricao: `Código emergencial de redefinição de senha solicitado para ${user.email}.`,
      });

      const waMsg = encodeURIComponent(
        `Olá Robson, estou solicitando a redefinição emergencial da minha senha no Connect Platz CRM.\n\nE-mail: ${user.email}\nCódigo gerado: ${emergencyCode}`
      );
      const waUrl = `https://wa.me/5585999990001?text=${waMsg}`;

      return NextResponse.json({
        success: true,
        message: "Chave emergencial gerada com sucesso. Validade de 2 horas.",
        emergencyCode,
        whatsAppUrl: waUrl,
      });
    }

    // Ação 2.2: Validar Código e Redefinir Senha
    if (action === "reset") {
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanCode = String(code || "").trim();
      const cleanPassword = String(newPassword || "").trim();

      if (!cleanEmail || !cleanCode || !cleanPassword) {
        return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
      }

      if (cleanPassword.length < 8) {
        return NextResponse.json({ error: "A nova senha deve ter no mínimo 8 caracteres." }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user || !user.emergencyResetToken || !user.emergencyResetExpiresAt) {
        return NextResponse.json(
          { error: "Nenhuma solicitação de redefinição ativa para este e-mail. Solicite um código primeiro." },
          { status: 400 }
        );
      }

      if (new Date() > new Date(user.emergencyResetExpiresAt)) {
        return NextResponse.json(
          { error: "O código emergencial expirou. Por favor, solicite um novo código." },
          { status: 400 }
        );
      }

      if (user.emergencyResetToken !== cleanCode) {
        return NextResponse.json({ error: "Código emergencial incorreto." }, { status: 400 });
      }

      const passwordHash = await hashPassword(cleanPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          emergencyResetToken: null,
          emergencyResetExpiresAt: null,
        },
      });

      await recordAudit({
        req,
        organizationId: user.organizationId,
        userId: user.id,
        acao: "Senha Redefinida por Código Emergencial",
        tipoAcao: "UPDATE",
        modulo: "AUTENTICACAO",
        entidade: "User",
        entidadeId: user.id,
        entidadeNome: user.nome,
        descricao: `Usuário ${user.nome} (${user.email}) concluiu a redefinição emergencial de senha com sucesso.`,
      });

      return NextResponse.json({
        success: true,
        message: "Senha redefinida com sucesso! Você já pode efetuar o login com a nova senha.",
      });
    }

    return NextResponse.json({ error: "Ação não especificada." }, { status: 400 });
  } catch (error: any) {
    console.error("Erro em /api/auth/emergency-reset:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao processar redefinição." }, { status: 500 });
  }
}
