import { PrismaPermissionRepository } from '../prisma/prisma-permission.repository';
import { PrismaRoleRepository } from '../prisma/prisma-role.repository';
import { PrismaUserRepository } from '../prisma/prisma-user.repository';
import { BcryptService } from '../security/bcrypt.service';
import { JwtTokenService } from '../security/jwt.service';
import { PRISMA_REPOSITORIES } from '../prisma/prisma.constants';
import { IDENTITY_TOKENS } from '../identity.tokens';

export const identityProviders = [
  PrismaUserRepository,
  PrismaRoleRepository,
  PrismaPermissionRepository,
  BcryptService,
  JwtTokenService,
  {
    provide: PRISMA_REPOSITORIES.USER_REPOSITORY,
    useExisting: PrismaUserRepository,
  },
  {
    provide: PRISMA_REPOSITORIES.ROLE_REPOSITORY,
    useExisting: PrismaRoleRepository,
  },
  {
    provide: PRISMA_REPOSITORIES.PERMISSION_REPOSITORY,
    useExisting: PrismaPermissionRepository,
  },
  {
    provide: IDENTITY_TOKENS.PASSWORD_HASHER,
    useExisting: BcryptService,
  },
  {
    provide: IDENTITY_TOKENS.TOKEN_SERVICE,
    useExisting: JwtTokenService,
  },
];
