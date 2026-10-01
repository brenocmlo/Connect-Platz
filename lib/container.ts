import { prisma } from "./db/prisma";
import { BcryptPasswordHasher } from "./infrastructure/security/BcryptPasswordHasher";
import { JwtTokenService } from "./infrastructure/security/JwtTokenService";
import { PrismaUserRepository } from "./infrastructure/repositories/PrismaUserRepository";
import { PrismaLeadRepository } from "./infrastructure/repositories/PrismaLeadRepository";
import { PrismaBookingRepository } from "./infrastructure/repositories/PrismaBookingRepository";
import { RoundRobinDistributionStrategy } from "./domain/distribution/RoundRobinDistributionStrategy";
import { CreditPolicyRegistry } from "./domain/credit/CreditPolicies";

import { AuthenticateUserUseCase } from "./application/usecases/AuthenticateUserUseCase";
import { RegisterUserUseCase } from "./application/usecases/RegisterUserUseCase";
import { DistributeLeadUseCase } from "./application/usecases/DistributeLeadUseCase";
import { IngestLeadUseCase } from "./application/usecases/IngestLeadUseCase";
import { CreateSeasonBookingUseCase } from "./application/usecases/CreateSeasonBookingUseCase";
import { ProcessSlaTransbordoUseCase } from "./application/usecases/ProcessSlaTransbordoUseCase";
import { QualifyCreditUseCase } from "./application/usecases/QualifyCreditUseCase";

/**
 * Composition Root (Dependency Injection Container):
 * Centraliza a resolução de dependências respeitando o Dependency Inversion Principle (DIP).
 * Nenhuma rota ou controller instancia dependências de baixo nível diretamente.
 */
class ServiceContainer {
  // Infraestrutura
  readonly passwordHasher = new BcryptPasswordHasher(12);
  readonly tokenService = new JwtTokenService();
  readonly userRepository = new PrismaUserRepository(prisma);
  readonly leadRepository = new PrismaLeadRepository(prisma);
  readonly bookingRepository = new PrismaBookingRepository(prisma);

  // Domínio & Estratégias (OCP/LSP)
  readonly distributionStrategy = new RoundRobinDistributionStrategy();
  readonly creditPolicyRegistry = new CreditPolicyRegistry();

  // Casos de Uso (SRP)
  readonly authenticateUserUseCase = new AuthenticateUserUseCase(
    this.userRepository,
    this.passwordHasher,
    this.tokenService
  );

  readonly registerUserUseCase = new RegisterUserUseCase(
    this.userRepository,
    this.passwordHasher
  );

  readonly distributeLeadUseCase = new DistributeLeadUseCase(
    this.userRepository,
    this.distributionStrategy
  );

  readonly ingestLeadUseCase = new IngestLeadUseCase(
    this.leadRepository,
    this.distributeLeadUseCase
  );

  readonly createSeasonBookingUseCase = new CreateSeasonBookingUseCase(
    this.bookingRepository
  );

  readonly processSlaTransbordoUseCase = new ProcessSlaTransbordoUseCase(
    this.leadRepository,
    this.distributeLeadUseCase
  );

  readonly qualifyCreditUseCase = new QualifyCreditUseCase(
    this.leadRepository,
    this.creditPolicyRegistry
  );
}

export const container = new ServiceContainer();
