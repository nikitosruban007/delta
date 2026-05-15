export type UserAccessSnapshot = {
  roles: string[];
  permissions: string[];
};

export class AccessService {
  buildAccessFromRoles(
    roles: Array<{
      role: {
        name: string;
        permissions: Array<{ permission: { code: string } }>;
      };
    }>,
  ): UserAccessSnapshot {
    const roleNames = roles.map((r) => r.role.name);
    const permissions = [
      ...new Set(
        roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code)),
      ),
    ];

    return {
      roles: roleNames,
      permissions,
    };
  }
}
