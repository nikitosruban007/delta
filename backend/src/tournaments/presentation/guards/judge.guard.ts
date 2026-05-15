import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Allows the request when the current user has at least one
 * judge_assignments row (i.e. is currently a judge of any tournament)
 * or has the ADMIN role. There is no standalone JUDGE role.
 */
@Injectable()
export class JudgeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;
    if (user.roles?.includes('ADMIN')) return true;
    const id = Number(user.id);
    if (!Number.isInteger(id) || id <= 0) return false;
    const found = await this.prisma.judge_assignments.findFirst({
      where: { judge_id: id },
      select: { id: true },
    });
    return Boolean(found);
  }
}
