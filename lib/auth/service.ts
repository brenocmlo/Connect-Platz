import { prisma } from "../db/prisma";
import { hashPassword, verifyPassword } from "./password";
import { signSessionToken, SessionPayload } from "./jwt";
import { Role } from "@prisma/client";

export interface LoginResult {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    role: Role;
    organizationId: string;
    status: string;
    hasCheckedInToday: boolean;
  };
}

export class AuthService {
  /**
   * Autentica o usuário validando a senha hasheada com bcrypt
   */
  static async login(email: string, plainTextPassword: string): Promise<LoginResult> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        organization: true,
      },
    });

    if (!user || !user.isActive) {
      throw new Error("Credenciais inválidas ou conta inativa.");
    }

    const isPasswordValid = await verifyPassword(plainTextPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas.");
    }

    // Verificar se realizou check-in hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInToday = await prisma.checkIn.findFirst({
      where: {
        userId: user.id,
        date: today,
      },
    });

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      organizationId: user.organizationId,
    };

    const token = signSessionToken(payload);

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        status: user.status,
        hasCheckedInToday: !!checkInToday,
      },
    };
  }

  /**
   * Registra um novo usuário no banco com senha obrigatoriamente criptografada via bcrypt (salt rounds >= 12)
   */
  static async createUser(params: {
    organizationId: string;
    nome: string;
    email: string;
    password: string;
    role?: Role;
    telefone?: string;
    creci?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: params.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const passwordHash = await hashPassword(params.password);

    return prisma.user.create({
      data: {
        organizationId: params.organizationId,
        nome: params.nome,
        email: params.email.toLowerCase().trim(),
        passwordHash, // Bcrypt hash seguro
        role: params.role || Role.CORRETOR,
        telefone: params.telefone,
        creci: params.creci,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
