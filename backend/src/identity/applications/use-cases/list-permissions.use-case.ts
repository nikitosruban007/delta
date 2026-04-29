import { IPermissionRepository } from '../ports/permission-repository.port';

export class ListPermissionsUseCase {
  constructor(private readonly permissions: IPermissionRepository) {}

  execute() {
    return this.permissions.list();
  }
}
