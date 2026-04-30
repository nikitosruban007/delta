export interface RoleWithPermissions {
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
}

export interface IRoleRepository {
  findById(id: string): Promise<RoleWithPermissions | null>;
  findByName(name: string): Promise<RoleWithPermissions | null>;
  list(): Promise<RoleWithPermissions[]>;

  create(input: {
    name: string;
    description?: string | null;
    permissionIds?: string[];
  }): Promise<{ id: string; name: string; description: string | null }>;

  delete(id: string): Promise<void>;
}
