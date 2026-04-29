import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IPermissionRepository } from '../../application/ports/permission-repository.port';

@Injectable()
export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return this.prisma.permission.findUnique({ where: { code } });
  }

  async list() {
    return this.prisma.permission.findMany();
  }

  async create(input: { code: string; description?: string | null }) {
    return this.prisma.permission.create({
      data: {
        code: input.code,
        description: input.description ?? null,
      },
    });
  }
}
