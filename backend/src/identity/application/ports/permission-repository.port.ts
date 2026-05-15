export interface IPermissionRepository {
  findById(id: string): Promise<{
    id: string;
    code: string;
    description: string | null;
  } | null>;

  findByCode(code: string): Promise<{
    id: string;
    code: string;
    description: string | null;
  } | null>;

  list(): Promise<
    Array<{
      id: string;
      code: string;
      description: string | null;
    }>
  >;

  create(input: { code: string; description?: string | null }): Promise<{
    id: string;
    code: string;
    description: string | null;
  }>;
}
