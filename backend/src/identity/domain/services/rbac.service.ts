export class RbacService {
  hasRole(userRoles: string[], requiredRoles: string[]): boolean {
    if (!requiredRoles.length) return true;
    return requiredRoles.some((role) => userRoles.includes(role));
  }

  hasPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
    if (!requiredPermissions.length) return true;
    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }

  effectivePermissions(rolePermissions: Array<{ permission: { code: string } }>): string[] {
    return [...new Set(rolePermissions.map((item) => item.permission.code))];
  }
}
