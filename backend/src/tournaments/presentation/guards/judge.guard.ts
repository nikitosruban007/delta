import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class JudgeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return Boolean(req.user?.roles?.includes('JUDGE') || req.user?.roles?.includes('ADMIN'));
  }
}
