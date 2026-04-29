import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Reflector,
} from '@nestjs/common';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) return true;

    const user = context.switchToHttp().getRequest().user;
    const userPermissions: string[] = user?.permissions ?? [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
