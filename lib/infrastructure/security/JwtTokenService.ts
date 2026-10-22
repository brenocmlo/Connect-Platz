import jwt, { SignOptions } from "jsonwebtoken";
import { ITokenService, UserTokenPayload } from "@/lib/core/interfaces/ITokenService";
import { getJwtSecret } from "@/lib/auth/secret";

export class JwtTokenService implements ITokenService {
  private readonly expiresIn: SignOptions["expiresIn"];

  constructor(private readonly secret?: string, expiresIn: SignOptions["expiresIn"] = "7d") {
    this.expiresIn = expiresIn;
  }

  // Resolvido a cada uso: nunca há segredo padrão embutido no código
  private resolveSecret(): string {
    return this.secret || getJwtSecret();
  }

  generateToken(payload: UserTokenPayload): string {
    return jwt.sign(payload, this.resolveSecret(), {
      expiresIn: this.expiresIn,
    });
  }

  verifyToken(token: string): UserTokenPayload | null {
    if (!token) return null;
    try {
      return jwt.verify(token, this.resolveSecret()) as UserTokenPayload;
    } catch {
      return null;
    }
  }
}
