import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IdentityInfrastructureModule } from '../infrastructure/identity.infrastructure.module';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { GetMeUseCase } from '../application/use-cases/get-me.use-case';
import { AssignRoleUseCase } from '../application/use-cases/assign-role.use-case';
import { RevokeRoleUseCase } from '../application/use-cases/revoke-role.use-case';
import { CreateRoleUseCase } from '../application/use-cases/create-role.use-case';
import { CreatePermissionUseCase } from '../application/use-cases/create-permission.use-case';
import { ListRolesUseCase } from '../application/use-cases/list-roles.use-case';
import { ListPermissionsUseCase } from '../application/use-cases/list-permissions.use-case';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { RolesController } from './controllers/roles.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { identityProviders } from '../infrastructure/providers/identity.providers';

@Module({
  imports: [IdentityInfrastructureModule],
  controllers: [
    AuthController,
    UsersController,
    RolesController,
    PermissionsController,
  ],
  providers: [
    Reflector,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    ...identityProviders,
    {
      provide: RegisterUseCase,
      useFactory: (users, hasher, tokenService) =>
        new RegisterUseCase(users, hasher, tokenService),
      inject: [
        identityProviders[0],
        identityProviders[3],
        identityProviders[4],
      ],
    },
    {
      provide: LoginUseCase,
      useFactory: (users, hasher, tokenService) =>
        new LoginUseCase(users, hasher, tokenService),
      inject: [
        identityProviders[0],
        identityProviders[3],
        identityProviders[4],
      ],
    },
    {
      provide: GetMeUseCase,
      useFactory: (users) => new GetMeUseCase(users),
      inject: [identityProviders[0]],
    },
    {
      provide: AssignRoleUseCase,
      useFactory: (users, roles) => new AssignRoleUseCase(users, roles),
      inject: [identityProviders[0], identityProviders[1]],
    },
    {
      provide: RevokeRoleUseCase,
      useFactory: (users, roles) => new RevokeRoleUseCase(users, roles),
      inject: [identityProviders[0], identityProviders[1]],
    },
    {
      provide: CreateRoleUseCase,
      useFactory: (roles, permissions) => new CreateRoleUseCase(roles, permissions),
      inject: [identityProviders[1], identityProviders[2]],
    },
    {
      provide: CreatePermissionUseCase,
      useFactory: (permissions) => new CreatePermissionUseCase(permissions),
      inject: [identityProviders[2]],
    },
    {
      provide: ListRolesUseCase,
      useFactory: (roles) => new ListRolesUseCase(roles),
      inject: [identityProviders[1]],
    },
    {
      provide: ListPermissionsUseCase,
      useFactory: (permissions) => new ListPermissionsUseCase(permissions),
      inject: [identityProviders[2]],
    },
  ],
  exports: [AuthController, UsersController, RolesController, PermissionsController],
})
export class IdentityPresentationModule {}
