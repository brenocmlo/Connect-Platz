import { IUserRepository } from "@/lib/core/interfaces/IUserRepository";
import { IPasswordHasher } from "@/lib/core/interfaces/IPasswordHasher";
import { ITokenService } from "@/lib/core/interfaces/ITokenService";
import { Role } from "@prisma/client";

export interface AuthenticateInput {
  email: string;
  plainTextPassword: string;
}

export interface AuthenticateOutput {
  token: string;
  user: {
    id: string;
    nome: string;
    email: string;
    role: Role;
    organizationId: string;
    status: string;
    hasCheckedInToday: boolean;
  };
}

/**
 * Single Responsibility Principle (SRP):
 * Caso de uso responsável unicamente por autenticar credenciais e emitir sessão.
 * Dependency Inversion Principle (DIP):
 * Depende exclusivamente de abstrações (IUserRepository, IPasswordHasher, ITokenService).
 */
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: AuthenticateInput): Promise<AuthenticateOutput> {
    const user = await this.userRepo.findByEmail(input.email);

    if (!user || !user.isActive) {
      throw new Error("Credenciais inválidas ou usuário inativo.");
    }

    const isValid = await this.hasher.compare(input.plainTextPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Credenciais inválidas.");
    }

    const hasCheckedIn = await this.userRepo.hasCheckedInToday(user.id, new Date());

    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      organizationId: user.organizationId,
    });

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        status: user.status,
        hasCheckedInToday: hasCheckedIn,
      },
    };
  }
}
