import bcrypt from "bcryptjs";

// Salt rounds padrão mínimo 12 conforme requisitos de alta segurança
const DEFAULT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 12;

/**
 * Gera o hash seguro de uma senha utilizando bcrypt com salt rounds configurado (mínimo 12).
 * Nenhuma senha deve ser persistida em texto plano no banco de dados.
 */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  if (!plainTextPassword || plainTextPassword.length < 6) {
    throw new Error("A senha deve conter no mínimo 6 caracteres.");
  }
  const salt = await bcrypt.genSalt(DEFAULT_SALT_ROUNDS);
  return bcrypt.hash(plainTextPassword, salt);
}

/**
 * Valida se a senha em texto plano corresponde ao hash bcrypt armazenado.
 */
export async function verifyPassword(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainTextPassword || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(plainTextPassword, hashedPassword);
}
