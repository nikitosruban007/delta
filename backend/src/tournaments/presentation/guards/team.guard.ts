import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TeamGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return Boolean(req.user?.roles?.includes('TEAM') || req.user?.roles?.includes('ADMIN'));
  }
}
