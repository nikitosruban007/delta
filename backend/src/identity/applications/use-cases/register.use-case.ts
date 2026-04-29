import { IUserRepository } from '../ports/user-repository.port';
import { IPasswordHasher } from '../ports/password-hasher.port';
import { ITokenService } from '../ports/token-service.port';
import { EmailAlreadyExistsError } from '../errors/email-already-exists.error';
import { AuthResult } from '../types/auth-result.type';

type RegisterInput = {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string | null;
};

export class RegisterUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new EmailAlreadyExistsError();

    const passwordHash = await this.hasher.hash(input.password);

    const user = await this.users.create({
      email: input.email,
      passwordHash,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
    });

    const fullUser = await this.users.getWithAccessById(user.id);
    if (!fullUser) {
      throw new Error('Failed to load created user');
    }

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
