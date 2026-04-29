import { IPermissionRepository } from '../ports/permission-repository.port';

type CreatePermissionInput = {
  code: string;
  description?: string | null;
};

export class CreatePermissionUseCase {
  constructor(private readonly permissions: IPermissionRepository) {}

  execute(input: CreatePermissionInput) {
    return this.permissions.create({
      code: input.code,
      description: input.description ?? null,
    });
  }
}
