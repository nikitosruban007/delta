import { IUserRepository } from '../ports/user-repository.port';
import { IRoleRepository } from '../ports/role-repository.port';
import { RoleNotFoundError } from '../errors/role-not-found.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

type RevokeRoleInput = {
  userId: string;
  roleId: string;
};

export class RevokeRoleUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly roles: IRoleRepository,
  ) {}

  async execute(input: RevokeRoleInput) {
    const user = await this.users.findById(input.userId);
    if (!user) throw new UserNotFoundError();

    const role = await this.roles.findById(input.roleId);
    if (!role) throw new RoleNotFoundError();

    await this.users.revokeRole({
      userId: input.userId,
      roleId: input.roleId,
    });

    return { success: true };
  }
}
