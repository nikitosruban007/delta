import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { AssignRoleUseCase } from './application/use-cases/assign-role.use-case';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { ListPermissionsUseCase } from './application/use-cases/list-permissions.use-case';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RevokeRoleUseCase } from './application/use-cases/revoke-role.use-case';
import { identityProviders } from './infrastructure/providers/identity.providers';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { IDENTITY_TOKENS } from './infrastructure/identity.tokens';
import { AuthController } from './presentation/controllers/auth.controller';
import { PermissionsController } from './presentation/controllers/permissions.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { PermissionsGuard } from './presentation/guards/permissions.guard';
import { RolesGuard } from './presentation/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
  ],
  providers: [
    ...identityProviders,
    JwtStrategy,
    Reflector,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    {
      provide: RegisterUseCase,
      useFactory: (users, hasher, tokenService) =>
        new RegisterUseCase(users, hasher, tokenService),
      inject: [
        IDENTITY_TOKENS.USER_REPOSITORY,
        IDENTITY_TOKENS.PASSWORD_HASHER,
        IDENTITY_TOKENS.TOKEN_SERVICE,
      ],
    },
    {
      provide: LoginUseCase,
      useFactory: (users, hasher, tokenService) =>
        new LoginUseCase(users, hasher, tokenService),
      inject: [
        IDENTITY_TOKENS.USER_REPOSITORY,
        IDENTITY_TOKENS.PASSWORD_HASHER,
        IDENTITY_TOKENS.TOKEN_SERVICE,
      ],
    },
    {
      provide: GetMeUseCase,
      useFactory: (users) => new GetMeUseCase(users),
      inject: [IDENTITY_TOKENS.USER_REPOSITORY],
    },
    {
      provide: AssignRoleUseCase,
      useFactory: (users, roles) => new AssignRoleUseCase(users, roles),
      inject: [IDENTITY_TOKENS.USER_REPOSITORY, IDENTITY_TOKENS.ROLE_REPOSITORY],
    },
    {
      provide: RevokeRoleUseCase,
      useFactory: (users, roles) => new RevokeRoleUseCase(users, roles),
      inject: [IDENTITY_TOKENS.USER_REPOSITORY, IDENTITY_TOKENS.ROLE_REPOSITORY],
    },
    {
      provide: CreateRoleUseCase,
      useFactory: (roles, permissions) => new CreateRoleUseCase(roles, permissions),
      inject: [
        IDENTITY_TOKENS.ROLE_REPOSITORY,
        IDENTITY_TOKENS.PERMISSION_REPOSITORY,
      ],
    },
    {
      provide: CreatePermissionUseCase,
      useFactory: (permissions) => new CreatePermissionUseCase(permissions),
      inject: [IDENTITY_TOKENS.PERMISSION_REPOSITORY],
    },
    {
      provide: ListRolesUseCase,
      useFactory: (roles) => new ListRolesUseCase(roles),
      inject: [IDENTITY_TOKENS.ROLE_REPOSITORY],
    },
    {
      provide: ListPermissionsUseCase,
      useFactory: (permissions) => new ListPermissionsUseCase(permissions),
      inject: [IDENTITY_TOKENS.PERMISSION_REPOSITORY],
    },
  ],
  exports: [
    IDENTITY_TOKENS.USER_REPOSITORY,
    IDENTITY_TOKENS.ROLE_REPOSITORY,
    IDENTITY_TOKENS.PERMISSION_REPOSITORY,
    IDENTITY_TOKENS.PASSWORD_HASHER,
    IDENTITY_TOKENS.TOKEN_SERVICE,
  ],
})
export class IdentityModule {}
