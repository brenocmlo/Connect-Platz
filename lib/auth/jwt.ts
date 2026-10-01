import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "connect_platz_jwt_super_secret_key_change_in_production_2026";
const TOKEN_EXPIRY = "7d";

export interface SessionPayload {
  userId: string;
  email: string;
  nome: string;
  role: Role;
  organizationId: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}
