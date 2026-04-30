import { IUserRepository } from '../ports/user-repository.port';
import { UserNotFoundError } from '../errors/user-not-found.error';

export class GetMeUseCase {
  constructor(private readonly users: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.users.getWithAccessById(userId);
    if (!user) throw new UserNotFoundError();

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      roles: user.roles.map((r) => r.role.name),
      permissions: [
        ...new Set(
          user.roles.flatMap((r) =>
            r.role.permissions.map((p) => p.permission.code),
          ),
        ),
      ],
    };
  }
}
