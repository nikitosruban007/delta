import { IUserRepository } from '../ports/user-repository.port';
import { IRoleRepository } from '../ports/role-repository.port';
import { RoleNotFoundError } from '../errors/role-not-found.error';
import { UserNotFoundError } from '../errors/user-not-found.error';

type AssignRoleInput = {
  userId: string;
  roleId: string;
  assignedBy?: string | null;
};

export class AssignRoleUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly roles: IRoleRepository,
  ) {}

  async execute(input: AssignRoleInput) {
    const user = await this.users.findById(input.userId);
    if (!user) throw new UserNotFoundError();

    const role = await this.roles.findById(input.roleId);
    if (!role) throw new RoleNotFoundError();

    await this.users.assignRole({
      userId: input.userId,
      roleId: input.roleId,
      assignedBy: input.assignedBy ?? null,
    });

    return { success: true };
  }
}
