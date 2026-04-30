import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IRoleRepository } from '../../application/ports/role-repository.port';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const role = await this.prisma.roles.findUnique({
      where: { id: this.parseId(id) },
      include: {
        role_permissions: {
          include: { permissions: true },
        },
      },
    });

    return role ? this.toRoleWithPermissions(role) : null;
  }

  async findByName(name: string) {
    const role = await this.prisma.roles.findUnique({
      where: { name },
      include: {
        role_permissions: {
          include: { permissions: true },
        },
      },
    });

    return role ? this.toRoleWithPermissions(role) : null;
  }

  async list() {
    const roles = await this.prisma.roles.findMany({
      include: {
        role_permissions: {
          include: { permissions: true },
        },
      },
    });

    return roles.map((role) => this.toRoleWithPermissions(role));
  }

  async create(input: {
    name: string;
    description?: string | null;
    permissionIds?: string[];
  }) {
    const role = await this.prisma.roles.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        role_permissions: input.permissionIds?.length
          ? {
              create: input.permissionIds.map((permissionId) => ({
                permissions: {
                  connect: {
                    id: this.parseId(permissionId),
                  },
                },
              })),
            }
          : undefined,
      },
    });

    return {
      id: String(role.id),
      name: role.name,
      description: role.description,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.roles.delete({ where: { id: this.parseId(id) } });
  }

  private toRoleWithPermissions(role: {
    id: number;
    name: string;
    description: string | null;
    role_permissions: Array<{
      permissions: {
        id: number;
        code: string;
        description: string | null;
      };
    }>;
  }) {
    return {
      id: String(role.id),
      name: role.name,
      description: role.description,
      permissions: role.role_permissions.map((rolePermission) => ({
        permission: {
          id: String(rolePermission.permissions.id),
          code: rolePermission.permissions.code,
          description: rolePermission.permissions.description,
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
