import { Role } from "@prisma/client";

export interface UserTokenPayload {
  userId: string;
  email: string;
  nome: string;
  role: Role;
  organizationId: string;
}

/**
 * Abstração para geração e verificação de tokens de autenticação/sessão.
 */
export interface ITokenService {
  generateToken(payload: UserTokenPayload): string;
  verifyToken(token: string): UserTokenPayload | null;
}
