import { IUserRepository } from '../ports/user-repository.port';
import { IPasswordHasher } from '../ports/password-hasher.port';
import { ITokenService } from '../ports/token-service.port';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { AuthResult } from '../types/auth-result.type';

type LoginInput = {
  email: string;
  password: string;
};

export class LoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user || !user.isActive) throw new InvalidCredentialsError();

    const valid = await this.hasher.compare(input.password, user.passwordHash);
    if (!valid) throw new InvalidCredentialsError();

    const fullUser = await this.users.getWithAccessById(user.id);
    if (!fullUser) throw new InvalidCredentialsError();

    const roles = fullUser.roles.map((r) => r.role.name);
    const permissions = [
      ...new Set(
        fullUser.roles.flatMap((r) =>
          r.role.permissions.map((p) => p.permission.code),
        ),
      ),
    ];

    const accessToken = await this.tokenService.sign({
      sub: user.id,
      email: user.email,
      roles,
      permissions,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        roles,
        permissions,
      },
      accessToken,
    };
  }
}
