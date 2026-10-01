import jwt, { SignOptions } from "jsonwebtoken";
import { ITokenService, UserTokenPayload } from "@/lib/core/interfaces/ITokenService";

export class JwtTokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: SignOptions["expiresIn"];

  constructor(secret?: string, expiresIn: SignOptions["expiresIn"] = "7d") {
    this.secret = secret || process.env.JWT_SECRET || "connect_platz_jwt_super_secret_key_change_in_production_2026";
    this.expiresIn = expiresIn;
  }

  generateToken(payload: UserTokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
  }

  verifyToken(token: string): UserTokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as UserTokenPayload;
    } catch {
      return null;
    }
  }
}
