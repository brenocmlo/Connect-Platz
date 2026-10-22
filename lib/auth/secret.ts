// lib/auth/secret.ts
// Resolução única do segredo JWT (Node e Edge). Nunca usa valor padrão público.

const KNOWN_INSECURE_SECRETS = new Set([
  "connect_platz_jwt_super_secret_key_change_in_production_2026",
  "changeme",
  "secret",
]);

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || KNOWN_INSECURE_SECRETS.has(secret)) {
    throw new Error(
      "JWT_SECRET ausente ou inseguro. Defina um segredo aleatório com pelo menos 32 caracteres no .env."
    );
  }
  return secret;
}
