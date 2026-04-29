import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IUserRepository } from '../../application/ports/user-repository.port';
import { UserAccess } from '../../domain/types/access.types';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserAccess | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.selectUser(),
    });
  }

  async findByEmail(email: string): Promise<UserAccess | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: this.selectUser(),
    });
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    avatarUrl?: string | null;
  }): Promise<UserAccess> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
        avatarUrl: input.avatarUrl ?? null,
      },
      select: this.selectUser(),
    });
  }

  async getWithAccessById(id: string): Promise<UserAccess | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.selectUserWithAccess(),
    });
  }

  async assignRole(input: {
    userId: string;
    roleId: string;
    assignedBy?: string | null;
  }): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId: input.userId,
        roleId: input.roleId,
        assignedBy: input.assignedBy ?? null,
      },
    });
  }

  async revokeRole(input: { userId: string; roleId: string }): Promise<void> {
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: input.userId,
          roleId: input.roleId,
        },
      },
    });
  }

  private selectUser() {
    return {
      id: true,
      email: true,
      passwordHash: true,
      name: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }

  private selectUserWithAccess() {
    return {
      id: true,
      email: true,
      passwordHash: true,
      name: true,
      avatarUrl: true,
      isActive: true,
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    } as const;
  }
}
