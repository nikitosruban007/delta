import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IPermissionRepository } from '../../application/ports/permission-repository.port';

@Injectable()
export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const permission = await this.prisma.permissions.findUnique({
      where: { id: this.parseId(id) },
    });

    return permission ? this.toPermission(permission) : null;
  }

  async findByCode(code: string) {
    const permission = await this.prisma.permissions.findUnique({
      where: { code },
    });

    return permission ? this.toPermission(permission) : null;
  }

  async list() {
    const permissions = await this.prisma.permissions.findMany();

    return permissions.map((permission) => this.toPermission(permission));
  }

  async create(input: { code: string; description?: string | null }) {
    const permission = await this.prisma.permissions.create({
      data: {
        code: input.code,
        description: input.description ?? null,
      },
    });

    return this.toPermission(permission);
  }

  private toPermission(permission: {
    id: number;
    code: string;
    description: string | null;
  }) {
    return {
      id: String(permission.id),
      code: permission.code,
      description: permission.description,
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
