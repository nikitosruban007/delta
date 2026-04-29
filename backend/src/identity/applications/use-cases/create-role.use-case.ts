import { IRoleRepository } from '../ports/role-repository.port';
import { IPermissionRepository } from '../ports/permission-repository.port';
import { PermissionNotFoundError } from '../errors/permission-not-found.error';

type CreateRoleInput = {
  name: string;
  description?: string | null;
  permissionCodes?: string[];
};

export class CreateRoleUseCase {
  constructor(
    private readonly roles: IRoleRepository,
    private readonly permissions: IPermissionRepository,
  ) {}

  async execute(input: CreateRoleInput) {
    if (input.permissionCodes?.length) {
      for (const code of input.permissionCodes) {
        const permission = await this.permissions.findByCode(code);
        if (!permission) throw new PermissionNotFoundError();
      }
    }

    return this.roles.create({
      name: input.name,
      description: input.description ?? null,
    });
  }
}
