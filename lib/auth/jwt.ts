import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { getJwtSecret } from "./secret";

const TOKEN_EXPIRY = "7d";

export interface SessionPayload {
  userId: string;
  email: string;
  nome: string;
  role: Role;
  organizationId: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}
