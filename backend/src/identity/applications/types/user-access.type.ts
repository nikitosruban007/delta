export type UserAccess = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: Array<{
    role: {
      id: string;
      name: string;
      description: string | null;
      permissions: Array<{
        permission: {
          id: string;
          code: string;
          description: string | null;
        };
      }>;
    };
  }>;
};
