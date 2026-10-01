import { PrismaClient, User, CheckIn, CorretorStatus, Role } from "@prisma/client";
import { IUserRepository, CreateUserData } from "@/lib/core/interfaces/IUserRepository";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        organizationId: data.organizationId,
        nome: data.nome,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role || Role.CORRETOR,
        telefone: data.telefone,
        creci: data.creci,
      },
    });
  }

  async updateStatus(userId: string, status: CorretorStatus): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async updateLastLeadAssignedAt(userId: string, date: Date): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLeadAssignedAt: date },
    });
  }

  async findEligibleCorretores(organizationId: string, today: Date): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        organizationId,
        isActive: true,
        role: Role.CORRETOR,
        status: CorretorStatus.DISPONIVEL,
        checkIns: {
          some: {
            date: today,
          },
        },
      },
      orderBy: [
        { lastLeadAssignedAt: { sort: "asc", nulls: "first" } },
        { createdAt: "asc" },
      ],
    });
  }

  async registerCheckIn(userId: string, date: Date, ip?: string): Promise<CheckIn> {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const checkIn = await this.prisma.checkIn.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        checkedInAt: new Date(),
        userIp: ip,
      },
      create: {
        userId,
        date: today,
        checkedInAt: new Date(),
        userIp: ip,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: CorretorStatus.DISPONIVEL,
        dailyCheckInAt: new Date(),
      },
    });

    return checkIn;
  }

  async hasCheckedInToday(userId: string, today: Date): Promise<boolean> {
    const day = new Date(today);
    day.setHours(0, 0, 0, 0);

    const found = await this.prisma.checkIn.findFirst({
      where: {
        userId,
        date: day,
      },
    });

    return !!found;
  }
}
