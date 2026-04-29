export class AccessMapper {
  static rolesFromUser(user: {
    roles: Array<{
      role: {
        name: string;
        permissions: Array<{ permission: { code: string } }>;
      };
    }>;
  }): { roles: string[]; permissions: string[] } {
    const roles = user.roles.map((r) => r.role.name);
    const permissions = [
      ...new Set(
        user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code)),
      ),
    ];

    return { roles, permissions };
  }
}
