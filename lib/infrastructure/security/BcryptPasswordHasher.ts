import bcrypt from "bcryptjs";
import { IPasswordHasher } from "@/lib/core/interfaces/IPasswordHasher";

/**
 * Implementação de hashing com Bcrypt respeitando SRP e LSP.
 */
export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  async hash(plainText: string): Promise<string> {
    if (!plainText || plainText.length < 6) {
      throw new Error("A senha deve conter no mínimo 6 caracteres.");
    }
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(plainText, salt);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    if (!plainText || !hash) return false;
    return bcrypt.compare(plainText, hash);
  }
}
