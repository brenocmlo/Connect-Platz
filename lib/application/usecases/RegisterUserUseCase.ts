import { IUserRepository, CreateUserData } from "@/lib/core/interfaces/IUserRepository";
import { IPasswordHasher } from "@/lib/core/interfaces/IPasswordHasher";
import { User, Role } from "@prisma/client";

export interface RegisterUserInput {
  organizationId: string;
  nome: string;
  email: string;
  password: string;
  role?: Role;
  telefone?: string;
  creci?: string;
}

/**
 * Single Responsibility: Cadastro de novos usuários com criptografia obrigatória via Bcrypt.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hasher: IPasswordHasher
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const passwordHash = await this.hasher.hash(input.password);

    return this.userRepo.create({
      organizationId: input.organizationId,
      nome: input.nome,
      email: input.email,
      passwordHash,
      role: input.role,
      telefone: input.telefone,
      creci: input.creci,
    });
  }
}
