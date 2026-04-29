export class UserMapper {
  static toProfile(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    isActive: boolean;
    roles?: Array<{
      role: {
        name: string;
        permissions: Array<{ permission: { code: string } }>;
      };
    }>;
  }) {
    const roles =
      user.roles?.map((r) => r.role.name) ?? [];

    const permissions =
      user.roles
        ? [...new Set(user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission.code)))]
        : [];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      roles,
      permissions,
    };
  }
}
