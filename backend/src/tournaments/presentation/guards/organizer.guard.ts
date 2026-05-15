import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class OrganizerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return Boolean(
      req.user?.roles?.includes('ORGANIZER') ||
      req.user?.roles?.includes('ADMIN'),
    );
  }
}
