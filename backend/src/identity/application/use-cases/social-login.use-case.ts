import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { ITokenService } from '../ports/token-service.port';
import { IUserRepository } from '../ports/user-repository.port';
import { AuthResult } from '../types/auth-result.type';

export type SocialProvider = 'google' | 'github';

export type SocialLoginInput = {
  provider: SocialProvider;
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

export class SocialLoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: SocialLoginInput): Promise<AuthResult> {
    const providerUser =
      input.provider === 'google'
        ? await this.users.findByGoogleId(input.providerId)
        : await this.users.findByGithubId(input.providerId);

    if (providerUser) {
      if (!providerUser.isActive) throw new InvalidCredentialsError();
      return this.buildAuthResult(providerUser.id);
    }

    const email = input.email.trim().toLowerCase();
    const existingByEmail = await this.users.findByEmail(email);

    if (existingByEmail) {
      if (!existingByEmail.isActive) throw new InvalidCredentialsError();

      await this.users.linkSocialAccount({
        userId: existingByEmail.id,
        provider: input.provider,
        providerId: input.providerId,
      });

      return this.buildAuthResult(existingByEmail.id);
    }

    const createdUser = await this.users.create({
      email,
      passwordHash: null,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
      googleId: input.provider === 'google' ? input.providerId : null,
      githubId: input.provider === 'github' ? input.providerId : null,
    });

    return this.buildAuthResult(createdUser.id);
  }

  private async buildAuthResult(userId: string): Promise<AuthResult> {
    const fullUser = await this.users.getWithAccessById(userId);
    if (!fullUser || !fullUser.isActive) throw new InvalidCredentialsError();

    const roles = fullUser.roles.map((r) => r.role.name);
    const permissions = [
      ...new Set(
        fullUser.roles.flatMap((r) =>
          r.role.permissions.map((p) => p.permission.code),
        ),
      ),
    ];

    const accessToken = await this.tokenService.sign({
      sub: fullUser.id,
      email: fullUser.email,
      roles,
      permissions,
    });

    return {
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        avatarUrl: fullUser.avatarUrl,
        roles,
        permissions,
      },
      accessToken,
    };
  }
}
