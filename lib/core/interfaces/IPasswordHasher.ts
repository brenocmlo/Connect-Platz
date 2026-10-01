/**
 * Interface Segregation & Dependency Inversion:
 * Abstração para algoritmos de hashing e validação criptográfica de senhas.
 */
export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}
