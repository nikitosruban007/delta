import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Reflector,
} from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) return true;

    const user = context.switchToHttp().getRequest().user;
    const userRoles: string[] = user?.roles ?? [];

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
