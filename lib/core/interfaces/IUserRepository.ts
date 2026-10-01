import { User, CheckIn, CorretorStatus, Role } from "@prisma/client";

export interface CreateUserData {
  organizationId: string;
  nome: string;
  email: string;
  passwordHash: string;
  role?: Role;
  telefone?: string;
  creci?: string;
}

/**
 * Abstração para persistência de Usuários e Presença (Check-in).
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  updateStatus(userId: string, status: CorretorStatus): Promise<User>;
  updateLastLeadAssignedAt(userId: string, date: Date): Promise<User>;
  findEligibleCorretores(organizationId: string, date: Date): Promise<User[]>;
  registerCheckIn(userId: string, date: Date, ip?: string): Promise<CheckIn>;
  hasCheckedInToday(userId: string, date: Date): Promise<boolean>;
}
