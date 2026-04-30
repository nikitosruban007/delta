import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository } from '../../application/ports/user-repository.port';
import { UserAccess } from '../../application/types/user-access.type';

type PrismaUserWithAccess = Awaited<
  ReturnType<PrismaUserRepository['findUserWithAccessRecord']>
>;

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserAccess | null> {
    const user = await this.prisma.users.findUnique({
      where: { id: this.parseId(id) },
    });

    return user ? this.toUserAccess(user) : null;
  }

  async findByEmail(email: string): Promise<UserAccess | null> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    return user ? this.toUserAccess(user) : null;
  }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    avatarUrl?: string | null;
  }): Promise<UserAccess> {
    const user = await this.prisma.users.create({
      data: {
        email: input.email,
        password_hash: input.passwordHash,
        name: input.name,
        avatar_url: input.avatarUrl ?? null,
      },
    });

    return this.toUserAccess(user);
  }

  async getWithAccessById(id: string): Promise<UserAccess | null> {
    const user = await this.findUserWithAccessRecord(id);

    return user ? this.toUserAccessWithRoles(user) : null;
  }

  async assignRole(input: {
    userId: string;
    roleId: string;
    assignedBy?: string | null;
  }): Promise<void> {
    await this.prisma.user_roles.create({
      data: {
        user_id: this.parseId(input.userId),
        role_id: this.parseId(input.roleId),
      },
    });
  }

  async revokeRole(input: { userId: string; roleId: string }): Promise<void> {
    const userRole = await this.prisma.user_roles.findFirst({
      where: {
        user_id: this.parseId(input.userId),
        role_id: this.parseId(input.roleId),
      },
    });

    if (!userRole) {
      return;
    }

    await this.prisma.user_roles.delete({
      where: {
        id: userRole.id,
      },
    });
  }

  private async findUserWithAccessRecord(id: string) {
    return this.prisma.users.findUnique({
      where: { id: this.parseId(id) },
      include: {
        user_roles_user_roles_user_idTousers: {
          include: {
            roles: {
              include: {
                role_permissions: {
                  include: {
                    permissions: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  private toUserAccess(user: {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    avatar_url: string | null;
    status: 'active' | 'disabled' | null;
  }): UserAccess {
    return {
      id: String(user.id),
      email: user.email,
      passwordHash: user.password_hash,
      name: user.name,
      avatarUrl: user.avatar_url,
      isActive: user.status !== 'disabled',
      roles: [],
    };
  }

  private toUserAccessWithRoles(user: NonNullable<PrismaUserWithAccess>): UserAccess {
    return {
      id: String(user.id),
      email: user.email,
      passwordHash: user.password_hash,
      name: user.name,
      avatarUrl: user.avatar_url,
      isActive: user.status !== 'disabled',
      roles: user.user_roles_user_roles_user_idTousers
        .filter((userRole) => userRole.roles)
        .map((userRole) => ({
          role: {
            id: String(userRole.roles!.id),
            name: userRole.roles!.name,
            description: userRole.roles!.description,
            permissions: userRole.roles!.role_permissions.map((rolePermission) => ({
              permission: {
                id: String(rolePermission.permissions.id),
                code: rolePermission.permissions.code,
                description: rolePermission.permissions.description,
              },
            })),
          },
        })),
    };
  }

  private parseId(value: string): number {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      throw new Error(`Invalid identity id: ${value}`);
    }

    return parsed;
  }
}
