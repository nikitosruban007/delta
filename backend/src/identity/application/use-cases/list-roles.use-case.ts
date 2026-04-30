import { IRoleRepository } from '../ports/role-repository.port';

export class ListRolesUseCase {
  constructor(private readonly roles: IRoleRepository) {}

  execute() {
    return this.roles.list();
  }
}
