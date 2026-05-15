import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { EmailAlreadyExistsError } from './application/errors/email-already-exists.error';
import { ForbiddenError } from './application/errors/forbidden.error';
import { InvalidCredentialsError } from './application/errors/invalid-credentials.error';
import { PermissionNotFoundError } from './application/errors/permission-not-found.error';
import { RoleNotFoundError } from './application/errors/role-not-found.error';
import { UserNotFoundError } from './application/errors/user-not-found.error';
import { IPermissionRepository } from './application/ports/permission-repository.port';
import {
  IRoleRepository,
  RoleWithPermissions,
} from './application/ports/role-repository.port';
import { IUserRepository } from './application/ports/user-repository.port';
import { UserAccess } from './application/types/user-access.type';
import { AssignRoleUseCase } from './application/use-cases/assign-role.use-case';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { ListPermissionsUseCase } from './application/use-cases/list-permissions.use-case';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RevokeRoleUseCase } from './application/use-cases/revoke-role.use-case';
import { Permission } from './domain/entities/permission.entity';
import { Role } from './domain/entities/role.entity';
import { RolePermission } from './domain/entities/role-permission.entity';
import { User } from './domain/entities/user.entity';
import { UserRole } from './domain/entities/user-role.entity';
import { InvalidEmailError } from './domain/errors/invalid-email.error';
import { InvalidPermissionCodeError } from './domain/errors/invalid-permission-code.error';
import { InvalidRoleNameError } from './domain/errors/invalid-role-name.error';
import { RoleAssignedEvent } from './domain/events/role-assigned.event';
import { UserRegisteredEvent } from './domain/events/user-registered.event';
import { AccessService } from './domain/services/access.service';
import { RbacService } from './domain/services/rbac.service';
import { Email } from './domain/value-objects/email.vo';
import { PasswordHash } from './domain/value-objects/password-hash.vo';
import { PermissionCode } from './domain/value-objects/permission-code.vo';
import { RoleName } from './domain/value-objects/role-name.vo';
import { IdentityModule } from './identity.module';
import { IDENTITY_TOKENS } from './infrastructure/identity.tokens';
import { AccessMapper } from './infrastructure/mappers/access.mapper';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { PrismaPermissionRepository } from './infrastructure/prisma/prisma-permission.repository';
import { PrismaRoleRepository } from './infrastructure/prisma/prisma-role.repository';
import { PrismaUserRepository } from './infrastructure/prisma/prisma-user.repository';
import { BcryptService } from './infrastructure/security/bcrypt.service';
import { JwtTokenService } from './infrastructure/security/jwt.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { AuthController } from './presentation/controllers/auth.controller';
import { PermissionsController } from './presentation/controllers/permissions.controller';
import { RolesController } from './presentation/controllers/roles.controller';
import { UsersController } from './presentation/controllers/users.controller';
import { AssignRoleDto } from './presentation/dto/assign-role.dto';
import {
  PERMISSIONS_KEY,
  Permissions,
} from './presentation/decorators/permissions.decorator';
import { ROLES_KEY, Roles } from './presentation/decorators/roles.decorator';
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { PermissionsGuard } from './presentation/guards/permissions.guard';
import { RolesGuard } from './presentation/guards/roles.guard';
import { PRESENTATION_TOKENS } from './presentation/presentation.tokens';
import { PrismaService } from '../prisma/prisma.service';
import * as identityBarrel from './index';
import * as applicationBarrel from './application';
import * as domainBarrel from './domain';
import * as infrastructureBarrel from './infrastructure';
import * as presentationBarrel from './presentation';

const permission = (code = 'users.read', id = 'permission-1') => ({
  id,
  code,
  description: null,
});

const role = (
  overrides: Partial<RoleWithPermissions> = {},
): RoleWithPermissions => ({
  id: 'role-1',
  name: 'Admin',
  description: null,
  permissions: [{ permission: permission() }],
  ...overrides,
});

const accessRole = (
  overrides: Partial<RoleWithPermissions> = {},
): UserAccess['roles'][number] => {
  const item = role(overrides);

  return {
    role: {
      id: item.id,
      name: item.name,
      description: item.description,
      permissions: item.permissions,
    },
  };
};

const user = (overrides: Partial<UserAccess> = {}): UserAccess => ({
  id: 'user-1',
  email: 'user@example.com',
  passwordHash: 'hashed-password',
  name: 'Test User',
  avatarUrl: null,
  isActive: true,
  roles: [],
  ...overrides,
});

const usersRepo = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  getWithAccessById: jest.fn(),
  assignRole: jest.fn(),
  revokeRole: jest.fn(),
});

const rolesRepo = (): jest.Mocked<IRoleRepository> => ({
  findById: jest.fn(),
  findByName: jest.fn(),
  list: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

const permissionsRepo = (): jest.Mocked<IPermissionRepository> => ({
  findById: jest.fn(),
  findByCode: jest.fn(),
  list: jest.fn(),
  create: jest.fn(),
});

const hasher = () => ({
  hash: jest.fn(),
  compare: jest.fn(),
});

const tokens = () => ({
  sign: jest.fn(),
});

describe('identity full coverage', () => {
  it('should load barrels, tokens, passive errors and events', () => {
    expect(identityBarrel.IdentityModule).toBe(IdentityModule);
    expect(applicationBarrel.RegisterUseCase).toBe(RegisterUseCase);
    expect(domainBarrel.RbacService).toBe(RbacService);
    expect(infrastructureBarrel.IDENTITY_TOKENS).toBe(IDENTITY_TOKENS);
    expect(presentationBarrel.AuthController).toBe(AuthController);
    expect(PRESENTATION_TOKENS.REGISTER_USE_CASE).toBeDefined();

    expect(new ForbiddenError()).toMatchObject({
      name: 'ForbiddenError',
      message: 'Forbidden',
    });
    expect(new InvalidEmailError()).toMatchObject({
      name: 'InvalidEmailError',
      message: 'Invalid email',
    });
    expect(new InvalidRoleNameError()).toMatchObject({
      name: 'InvalidRoleNameError',
      message: 'Role name cannot be empty',
    });
    expect(new InvalidPermissionCodeError()).toMatchObject({
      name: 'InvalidPermissionCodeError',
      message: 'Permission code cannot be empty',
    });

    const occurredAt = new Date('2026-01-01T00:00:00.000Z');
    expect(
      new UserRegisteredEvent('user-1', 'user@example.com', occurredAt),
    ).toEqual({
      userId: 'user-1',
      email: 'user@example.com',
      occurredAt,
    });
    expect(
      new RoleAssignedEvent('user-1', 'role-1', 'admin-1', occurredAt),
    ).toEqual({
      userId: 'user-1',
      roleId: 'role-1',
      assignedBy: 'admin-1',
      occurredAt,
    });

    const dto = new AssignRoleDto();
    dto.userId = 'user-1';
    dto.roleId = 'role-1';
    expect(dto).toMatchObject({ userId: 'user-1', roleId: 'role-1' });
  });

  describe('application use cases', () => {
    it('RegisterUseCase should register user successfully', async () => {
      const users = usersRepo();
      const passwordHasher = hasher();
      const tokenService = tokens();

      users.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue('hash-1');
      users.create.mockResolvedValue(
        user({ id: 'user-99', email: 'new@example.com' }),
      );
      users.getWithAccessById.mockResolvedValue(
        user({
          id: 'user-99',
          email: 'new@example.com',
          roles: [
            accessRole({
              permissions: [
                { permission: permission('users.read', 'p1') },
                { permission: permission('users.read', 'p2') },
              ],
            }),
          ],
        }),
      );
      tokenService.sign.mockReturnValue('jwt-token');

      await expect(
        new RegisterUseCase(users, passwordHasher, tokenService).execute({
          email: 'new@example.com',
          password: 'password123',
          name: 'New User',
        }),
      ).resolves.toEqual({
        user: {
          id: 'user-99',
          email: 'new@example.com',
          name: 'Test User',
          avatarUrl: null,
          roles: ['Admin'],
          permissions: ['users.read'],
        },
        accessToken: 'jwt-token',
      });
      expect(users.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        passwordHash: 'hash-1',
        name: 'New User',
        avatarUrl: null,
      });
    });

    it('RegisterUseCase should reject duplicate emails and failed reloads', async () => {
      const duplicateUsers = usersRepo();
      duplicateUsers.findByEmail.mockResolvedValue(user());

      await expect(
        new RegisterUseCase(duplicateUsers, hasher(), tokens()).execute({
          email: 'user@example.com',
          password: 'password123',
          name: 'User',
        }),
      ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

      const users = usersRepo();
      const passwordHasher = hasher();
      users.findByEmail.mockResolvedValue(null);
      passwordHasher.hash.mockResolvedValue('hash');
      users.create.mockResolvedValue(user());
      users.getWithAccessById.mockResolvedValue(null);

      await expect(
        new RegisterUseCase(users, passwordHasher, tokens()).execute({
          email: 'user@example.com',
          password: 'password123',
          name: 'User',
          avatarUrl: 'avatar.png',
        }),
      ).rejects.toThrow('Failed to load created user');
      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({ avatarUrl: 'avatar.png' }),
      );
    });

    it('LoginUseCase should login and reject all invalid credential cases', async () => {
      const users = usersRepo();
      const passwordHasher = hasher();
      const tokenService = tokens();

      users.findByEmail.mockResolvedValue(user({ avatarUrl: 'avatar.png' }));
      passwordHasher.compare.mockResolvedValue(true);
      users.getWithAccessById.mockResolvedValue(
        user({
          roles: [
            accessRole({
              permissions: [
                { permission: permission('users.read', 'p1') },
                { permission: permission('users.write', 'p2') },
              ],
            }),
            accessRole({
              id: 'role-2',
              name: 'Editor',
              permissions: [{ permission: permission('users.read', 'p1') }],
            }),
          ],
        }),
      );
      tokenService.sign.mockResolvedValue('jwt-token');

      await expect(
        new LoginUseCase(users, passwordHasher, tokenService).execute({
          email: 'user@example.com',
          password: 'password123',
        }),
      ).resolves.toEqual({
        user: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Test User',
          avatarUrl: 'avatar.png',
          roles: ['Admin', 'Editor'],
          permissions: ['users.read', 'users.write'],
        },
        accessToken: 'jwt-token',
      });

      const missing = usersRepo();
      missing.findByEmail.mockResolvedValue(null);
      await expect(
        new LoginUseCase(missing, hasher(), tokens()).execute({
          email: 'missing@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);

      const disabled = usersRepo();
      disabled.findByEmail.mockResolvedValue(user({ isActive: false }));
      await expect(
        new LoginUseCase(disabled, hasher(), tokens()).execute({
          email: 'user@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);

      passwordHasher.compare.mockResolvedValue(false);
      await expect(
        new LoginUseCase(users, passwordHasher, tokenService).execute({
          email: 'user@example.com',
          password: 'wrong',
        }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);

      passwordHasher.compare.mockResolvedValue(true);
      users.getWithAccessById.mockResolvedValue(null);
      await expect(
        new LoginUseCase(users, passwordHasher, tokenService).execute({
          email: 'user@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('GetMeUseCase should return profile or throw UserNotFoundError', async () => {
      const users = usersRepo();
      users.getWithAccessById.mockResolvedValue(
        user({
          roles: [
            accessRole({
              permissions: [
                { permission: permission('users.read', 'p1') },
                { permission: permission('users.read', 'p2') },
              ],
            }),
          ],
        }),
      );

      await expect(new GetMeUseCase(users).execute('user-1')).resolves.toEqual({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        avatarUrl: null,
        isActive: true,
        roles: ['Admin'],
        permissions: ['users.read'],
      });

      users.getWithAccessById.mockResolvedValue(null);
      await expect(
        new GetMeUseCase(users).execute('missing'),
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it('AssignRoleUseCase and RevokeRoleUseCase should cover success and errors', async () => {
      const users = usersRepo();
      const roles = rolesRepo();
      users.findById.mockResolvedValue(user());
      roles.findById.mockResolvedValue(role());

      await expect(
        new AssignRoleUseCase(users, roles).execute({
          userId: 'user-1',
          roleId: 'role-1',
          assignedBy: 'admin-1',
        }),
      ).resolves.toEqual({ success: true });
      expect(users.assignRole).toHaveBeenCalledWith({
        userId: 'user-1',
        roleId: 'role-1',
        assignedBy: 'admin-1',
      });

      await expect(
        new AssignRoleUseCase(users, roles).execute({
          userId: 'user-1',
          roleId: 'role-1',
        }),
      ).resolves.toEqual({ success: true });
      expect(users.assignRole).toHaveBeenLastCalledWith({
        userId: 'user-1',
        roleId: 'role-1',
        assignedBy: null,
      });

      await expect(
        new RevokeRoleUseCase(users, roles).execute({
          userId: 'user-1',
          roleId: 'role-1',
        }),
      ).resolves.toEqual({ success: true });
      expect(users.revokeRole).toHaveBeenCalledWith({
        userId: 'user-1',
        roleId: 'role-1',
      });

      users.findById.mockResolvedValue(null);
      await expect(
        new AssignRoleUseCase(users, roles).execute({
          userId: 'missing',
          roleId: 'role-1',
        }),
      ).rejects.toBeInstanceOf(UserNotFoundError);

      users.findById.mockResolvedValue(user());
      roles.findById.mockResolvedValue(null);
      await expect(
        new AssignRoleUseCase(users, roles).execute({
          userId: 'user-1',
          roleId: 'missing',
        }),
      ).rejects.toBeInstanceOf(RoleNotFoundError);

      await expect(
        new RevokeRoleUseCase(users, roles).execute({
          userId: 'user-1',
          roleId: 'missing',
        }),
      ).rejects.toBeInstanceOf(RoleNotFoundError);

      users.findById.mockResolvedValue(null);
      await expect(
        new RevokeRoleUseCase(users, roles).execute({
          userId: 'missing',
          roleId: 'role-1',
        }),
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it('role and permission use cases should create and list values', async () => {
      const roles = rolesRepo();
      const permissions = permissionsRepo();

      permissions.findByCode
        .mockResolvedValueOnce(permission('users.read', 'p1'))
        .mockResolvedValueOnce(null);
      roles.create.mockResolvedValue({
        id: 'role-1',
        name: 'Admin',
        description: null,
      });
      permissions.create.mockResolvedValue(permission('users.read', 'p1'));
      roles.list.mockResolvedValue([role()]);
      permissions.list.mockResolvedValue([permission('users.read', 'p1')]);

      await expect(
        new CreateRoleUseCase(roles, permissions).execute({
          name: 'Admin',
          permissionCodes: ['users.read'],
        }),
      ).resolves.toEqual({ id: 'role-1', name: 'Admin', description: null });
      expect(roles.create).toHaveBeenCalledWith({
        name: 'Admin',
        description: null,
        permissionIds: ['p1'],
      });

      await expect(
        new CreateRoleUseCase(roles, permissions).execute({
          name: 'Viewer',
          description: 'Read only',
        }),
      ).resolves.toEqual({ id: 'role-1', name: 'Admin', description: null });
      expect(roles.create).toHaveBeenCalledWith({
        name: 'Viewer',
        description: 'Read only',
        permissionIds: [],
      });

      await expect(
        new CreateRoleUseCase(roles, permissions).execute({
          name: 'Admin',
          permissionCodes: ['missing'],
        }),
      ).rejects.toBeInstanceOf(PermissionNotFoundError);

      await expect(
        new CreatePermissionUseCase(permissions).execute({
          code: 'users.read',
        }),
      ).resolves.toEqual(permission('users.read', 'p1'));
      expect(permissions.create).toHaveBeenCalledWith({
        code: 'users.read',
        description: null,
      });

      await expect(new ListRolesUseCase(roles).execute()).resolves.toEqual([
        role(),
      ]);
      await expect(
        new ListPermissionsUseCase(permissions).execute(),
      ).resolves.toEqual([permission('users.read', 'p1')]);
    });
  });

  describe('domain', () => {
    it('entities should mutate valid state and reject invalid state', () => {
      const domainUser = new User(
        'user-1',
        Email.create('USER@EXAMPLE.COM'),
        'hash',
        'Old',
        null,
        true,
      );
      domainUser.rename(' New ');
      domainUser.changeAvatar('avatar.png');
      domainUser.deactivate();
      domainUser.activate();

      expect(domainUser.name).toBe('New');
      expect(domainUser.avatarUrl).toBe('avatar.png');
      expect(domainUser.isActive).toBe(true);
      expect(() => domainUser.rename(' ')).toThrow('Name cannot be empty');

      const domainRole = new Role('role-1', ' Admin ', null);
      domainRole.rename(' Manager ');
      domainRole.setDescription('Manages users');
      expect(domainRole.name).toBe('Manager');
      expect(domainRole.description).toBe('Manages users');
      expect(() => new Role('role-1', ' ', null)).toThrow(
        'Role name cannot be empty',
      );
      expect(() => domainRole.rename(' ')).toThrow('Role name cannot be empty');

      const domainPermission = new Permission(
        'permission-1',
        ' users.read ',
        null,
      );
      domainPermission.rename(' users.write ');
      domainPermission.setDescription('Write users');
      expect(domainPermission.code).toBe('users.write');
      expect(domainPermission.description).toBe('Write users');
      expect(() => new Permission('permission-1', ' ', null)).toThrow(
        'Permission code cannot be empty',
      );
      expect(() => domainPermission.rename(' ')).toThrow(
        'Permission code cannot be empty',
      );
    });

    it('join entities and value objects should expose normalized values', () => {
      const assignedAt = new Date('2026-01-01T00:00:00.000Z');

      expect(
        new UserRole('ur-1', 'user-1', 'role-1', null, assignedAt),
      ).toMatchObject({
        id: 'ur-1',
        userId: 'user-1',
        roleId: 'role-1',
        assignedBy: null,
        assignedAt,
      });
      expect(new RolePermission('role-1', 'permission-1')).toMatchObject({
        roleId: 'role-1',
        permissionId: 'permission-1',
      });

      const email = Email.create(' USER@Example.COM ');
      expect(email.toString()).toBe('user@example.com');
      expect(email.equals(Email.create('user@example.com'))).toBe(true);
      expect(email.equals(Email.create('other@example.com'))).toBe(false);
      expect(() => Email.create('bad-email')).toThrow('Invalid email');
      expect(PasswordHash.create(' hash ').toString()).toBe('hash');
      expect(RoleName.create(' Admin ').toString()).toBe('Admin');
      expect(PermissionCode.create(' users.read ').toString()).toBe(
        'users.read',
      );
      expect(() => PasswordHash.create(' ')).toThrow(
        'Password hash cannot be empty',
      );
      expect(() => RoleName.create(' ')).toThrow('Role name cannot be empty');
      expect(() => PermissionCode.create(' ')).toThrow(
        'Permission code cannot be empty',
      );
    });

    it('RBAC and access services should calculate access', () => {
      const rbac = new RbacService();

      expect(rbac.hasRole([], [])).toBe(true);
      expect(rbac.hasRole(['Manager'], ['Admin', 'Manager'])).toBe(true);
      expect(rbac.hasRole(['Viewer'], ['Admin'])).toBe(false);
      expect(rbac.hasPermission([], [])).toBe(true);
      expect(rbac.hasPermission(['users.read'], ['users.read'])).toBe(true);
      expect(rbac.hasPermission(['users.read'], ['users.write'])).toBe(false);
      expect(
        rbac.effectivePermissions([
          { permission: { code: 'users.read' } },
          { permission: { code: 'users.read' } },
          { permission: { code: 'users.write' } },
        ]),
      ).toEqual(['users.read', 'users.write']);

      expect(
        new AccessService().buildAccessFromRoles([
          {
            role: {
              name: 'Admin',
              permissions: [
                { permission: { code: 'users.read' } },
                { permission: { code: 'users.write' } },
              ],
            },
          },
          {
            role: {
              name: 'Editor',
              permissions: [{ permission: { code: 'users.read' } }],
            },
          },
        ]),
      ).toEqual({
        roles: ['Admin', 'Editor'],
        permissions: ['users.read', 'users.write'],
      });
    });
  });

  describe('infrastructure', () => {
    const prismaUser = {
      id: 1,
      email: 'user@example.com',
      password_hash: 'hash',
      name: 'User',
      avatar_url: null,
      status: 'active' as const,
    };

    const prisma = () => ({
      users: { findUnique: jest.fn(), create: jest.fn() },
      user_roles: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
      roles: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      permissions: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    });

    it('PrismaUserRepository should query, map and mutate users', async () => {
      const db = prisma();
      db.users.findUnique.mockResolvedValue(prismaUser);
      db.users.create.mockResolvedValue({ ...prismaUser, status: 'disabled' });
      db.user_roles.findFirst.mockResolvedValue({ id: 10 });
      const repository = new PrismaUserRepository(db as any);

      await expect(repository.findById('1')).resolves.toMatchObject({
        id: '1',
        email: 'user@example.com',
        isActive: true,
        roles: [],
      });
      await expect(
        repository.findByEmail('user@example.com'),
      ).resolves.toMatchObject({
        id: '1',
      });
      await expect(
        repository.create({
          email: 'user@example.com',
          passwordHash: 'hash',
          name: 'User',
        }),
      ).resolves.toMatchObject({ isActive: false });
      await repository.assignRole({
        userId: '1',
        roleId: '2',
        assignedBy: '3',
      });
      await repository.revokeRole({ userId: '1', roleId: '2' });

      expect(db.users.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(db.user_roles.create).toHaveBeenCalledWith({
        data: { user_id: 1, role_id: 2 },
      });
      expect(db.user_roles.delete).toHaveBeenCalledWith({ where: { id: 10 } });

      db.user_roles.findFirst.mockResolvedValue(null);
      await repository.revokeRole({ userId: '1', roleId: '2' });
      expect(db.user_roles.delete).toHaveBeenCalledTimes(1);

      await expect(repository.findById('bad')).rejects.toThrow(
        'Invalid identity id: bad',
      );
    });

    it('PrismaUserRepository should map full access snapshots', async () => {
      const db = prisma();
      db.users.findUnique.mockResolvedValue({
        ...prismaUser,
        user_roles_user_roles_user_idTousers: [
          {
            roles: {
              id: 2,
              name: 'Admin',
              description: null,
              role_permissions: [
                {
                  permissions: { id: 3, code: 'users.read', description: null },
                },
              ],
            },
          },
          { roles: null },
        ],
      });

      await expect(
        new PrismaUserRepository(db as any).getWithAccessById('1'),
      ).resolves.toMatchObject({
        roles: [
          {
            role: {
              id: '2',
              name: 'Admin',
              permissions: [{ permission: { id: '3', code: 'users.read' } }],
            },
          },
        ],
      });
    });

    it('PrismaRoleRepository and PrismaPermissionRepository should query and map data', async () => {
      const db = prisma();
      const roleRecord = {
        id: 2,
        name: 'Admin',
        description: null,
        role_permissions: [
          { permissions: { id: 3, code: 'users.read', description: null } },
        ],
      };
      const permissionRecord = { id: 3, code: 'users.read', description: null };
      db.roles.findUnique.mockResolvedValue(roleRecord);
      db.roles.findMany.mockResolvedValue([roleRecord]);
      db.roles.create.mockResolvedValue({
        id: 2,
        name: 'Admin',
        description: null,
      });
      db.permissions.findUnique.mockResolvedValue(permissionRecord);
      db.permissions.findMany.mockResolvedValue([permissionRecord]);
      db.permissions.create.mockResolvedValue(permissionRecord);

      const roleRepository = new PrismaRoleRepository(db as any);
      await expect(roleRepository.findById('2')).resolves.toMatchObject({
        id: '2',
        permissions: [{ permission: { id: '3', code: 'users.read' } }],
      });
      await expect(roleRepository.findByName('Admin')).resolves.toMatchObject({
        id: '2',
      });
      await expect(roleRepository.list()).resolves.toHaveLength(1);
      await expect(
        roleRepository.create({ name: 'Admin', permissionIds: ['3'] }),
      ).resolves.toEqual({ id: '2', name: 'Admin', description: null });
      await roleRepository.create({ name: 'Viewer' });
      await roleRepository.delete('2');
      expect(db.roles.create).toHaveBeenNthCalledWith(1, {
        data: {
          name: 'Admin',
          description: null,
          role_permissions: {
            create: [{ permissions: { connect: { id: 3 } } }],
          },
        },
      });
      expect(db.roles.create).toHaveBeenNthCalledWith(2, {
        data: {
          name: 'Viewer',
          description: null,
          role_permissions: undefined,
        },
      });

      const permissionRepository = new PrismaPermissionRepository(db as any);
      await expect(permissionRepository.findById('3')).resolves.toEqual({
        id: '3',
        code: 'users.read',
        description: null,
      });
      await expect(
        permissionRepository.findByCode('users.read'),
      ).resolves.toMatchObject({
        id: '3',
      });
      await expect(permissionRepository.list()).resolves.toHaveLength(1);
      await permissionRepository.create({ code: 'users.read' });
      expect(db.permissions.create).toHaveBeenCalledWith({
        data: { code: 'users.read', description: null },
      });

      db.roles.findUnique.mockResolvedValue(null);
      db.permissions.findUnique.mockResolvedValue(null);
      await expect(roleRepository.findById('404')).resolves.toBeNull();
      await expect(permissionRepository.findById('404')).resolves.toBeNull();
      await expect(roleRepository.findById('bad')).rejects.toThrow(
        'Invalid identity id: bad',
      );
      await expect(permissionRepository.findById('bad')).rejects.toThrow(
        'Invalid identity id: bad',
      );
    });

    it('security services and mappers should work', async () => {
      const bcrypt = new BcryptService();
      const hash = await bcrypt.hash('password123');
      await expect(bcrypt.compare('password123', hash)).resolves.toBe(true);
      await expect(bcrypt.compare('wrong', hash)).resolves.toBe(false);

      const jwt = { sign: jest.fn().mockReturnValue('signed-token') };
      const payload = {
        sub: 'user-1',
        email: 'user@example.com',
        roles: ['Admin'],
        permissions: ['users.read'],
      };
      expect(
        new JwtTokenService(jwt as unknown as NestJwtService).sign(payload),
      ).toBe('signed-token');

      process.env.JWT_SECRET = 'test-secret';
      await expect(new JwtStrategy().validate(payload)).resolves.toEqual({
        id: 'user-1',
        email: 'user@example.com',
        roles: ['Admin'],
        permissions: ['users.read'],
      });

      const userWithRoles = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        avatarUrl: null,
        isActive: true,
        roles: [
          {
            role: {
              name: 'Admin',
              permissions: [
                { permission: { code: 'users.read' } },
                { permission: { code: 'users.read' } },
              ],
            },
          },
        ],
      };
      expect(AccessMapper.rolesFromUser(userWithRoles)).toEqual({
        roles: ['Admin'],
        permissions: ['users.read'],
      });
      expect(UserMapper.toProfile(userWithRoles)).toMatchObject({
        roles: ['Admin'],
        permissions: ['users.read'],
      });
      expect(
        UserMapper.toProfile({ ...userWithRoles, roles: undefined }),
      ).toMatchObject({
        roles: [],
        permissions: [],
      });
    });
  });

  describe('presentation', () => {
    const appWith = async (
      controllers: any[],
      providers: Array<{ provide: any; useValue: any }>,
    ) => {
      const moduleRef = await Test.createTestingModule({
        controllers,
        providers: [
          ...providers,
          Reflector,
          RolesGuard,
          PermissionsGuard,
          {
            provide: JwtAuthGuard,
            useValue: { canActivate: jest.fn(() => true) },
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({
          canActivate: (context) => {
            context.switchToHttp().getRequest().user = {
              id: 'user-1',
              roles: ['Admin'],
              permissions: ['users.read', 'users.write'],
            };
            return true;
          },
        })
        .compile();
      const app = moduleRef.createNestApplication();
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();
      return app;
    };

    it('controllers should route requests and validate DTOs', async () => {
      const auth = {
        register: {
          execute: jest.fn().mockResolvedValue({ accessToken: 'token' }),
        },
        login: {
          execute: jest.fn().mockResolvedValue({ accessToken: 'token' }),
        },
        me: { execute: jest.fn().mockResolvedValue({ id: 'user-1' }) },
      };
      const app = await appWith(
        [AuthController],
        [
          { provide: RegisterUseCase, useValue: auth.register },
          { provide: LoginUseCase, useValue: auth.login },
          { provide: GetMeUseCase, useValue: auth.me },
        ],
      );

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          name: 'User',
        })
        .expect(201);
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad', password: '123', name: 'A', extra: true })
        .expect(400);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'bad', password: '123' })
        .expect(400);
      await request(app.getHttpServer()).get('/auth/me').expect(200);
      expect(auth.me.execute).toHaveBeenCalledWith('user-1');
      await app.close();

      const authErrors = {
        register: {
          execute: jest.fn().mockRejectedValue(new EmailAlreadyExistsError()),
        },
        login: {
          execute: jest.fn().mockRejectedValue(new InvalidCredentialsError()),
        },
        me: { execute: jest.fn().mockRejectedValue(new UserNotFoundError()) },
      };
      const authErrorApp = await appWith(
        [AuthController],
        [
          { provide: RegisterUseCase, useValue: authErrors.register },
          { provide: LoginUseCase, useValue: authErrors.login },
          { provide: GetMeUseCase, useValue: authErrors.me },
        ],
      );

      await request(authErrorApp.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
          name: 'User',
        })
        .expect(409);
      await request(authErrorApp.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(401);
      await request(authErrorApp.getHttpServer()).get('/auth/me').expect(404);
      await authErrorApp.close();

      const roleUseCases = {
        createRole: { execute: jest.fn().mockResolvedValue({ id: 'role-1' }) },
        listRoles: { execute: jest.fn().mockResolvedValue([]) },
        createPermission: {
          execute: jest.fn().mockResolvedValue({ id: 'p1' }),
        },
        listPermissions: { execute: jest.fn().mockResolvedValue([]) },
        assignRole: { execute: jest.fn().mockResolvedValue({ success: true }) },
        revokeRole: { execute: jest.fn().mockResolvedValue({ success: true }) },
      };
      const adminApp = await appWith(
        [RolesController, PermissionsController, UsersController],
        [
          { provide: CreateRoleUseCase, useValue: roleUseCases.createRole },
          { provide: ListRolesUseCase, useValue: roleUseCases.listRoles },
          {
            provide: CreatePermissionUseCase,
            useValue: roleUseCases.createPermission,
          },
          {
            provide: ListPermissionsUseCase,
            useValue: roleUseCases.listPermissions,
          },
          { provide: AssignRoleUseCase, useValue: roleUseCases.assignRole },
          { provide: RevokeRoleUseCase, useValue: roleUseCases.revokeRole },
        ],
      );

      await request(adminApp.getHttpServer())
        .post('/roles')
        .send({ name: 'Admin', permissionCodes: ['users.read'] })
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/roles')
        .send({ name: 'Admin', permissionCodes: [] })
        .expect(400);
      await request(adminApp.getHttpServer()).get('/roles').expect(200);
      await request(adminApp.getHttpServer())
        .post('/permissions')
        .send({ code: 'users.read', description: 'Read users' })
        .expect(201);
      await request(adminApp.getHttpServer())
        .post('/permissions')
        .send({ code: 'users.read' })
        .expect(400);
      await request(adminApp.getHttpServer()).get('/permissions').expect(200);
      await request(adminApp.getHttpServer())
        .post('/users/user-2/roles')
        .send({ roleId: 'role-1' })
        .expect(201);
      await request(adminApp.getHttpServer())
        .delete('/users/user-2/roles/role-1')
        .expect(200);
      expect(roleUseCases.assignRole.execute).toHaveBeenCalledWith({
        userId: 'user-2',
        roleId: 'role-1',
        assignedBy: 'user-1',
      });
      await adminApp.close();
    });

    it('guards and decorators should grant and deny access', () => {
      class Controller {
        @Roles('Admin')
        @Permissions('users.read')
        handler() {
          return true;
        }
      }
      expect(
        Reflect.getMetadata(ROLES_KEY, Controller.prototype.handler),
      ).toEqual(['Admin']);
      expect(
        Reflect.getMetadata(PERMISSIONS_KEY, Controller.prototype.handler),
      ).toEqual(['users.read']);

      const context = (currentUser?: {
        roles?: string[];
        permissions?: string[];
      }) =>
        ({
          getHandler: jest.fn(),
          getClass: jest.fn(),
          switchToHttp: () => ({ getRequest: () => ({ user: currentUser }) }),
        }) as any;

      expect(
        new RolesGuard({
          getAllAndOverride: jest.fn().mockReturnValue(undefined),
        } as unknown as Reflector).canActivate(context()),
      ).toBe(true);
      expect(
        new RolesGuard({
          getAllAndOverride: jest.fn().mockReturnValue(['Admin']),
        } as unknown as Reflector).canActivate(context({ roles: ['Admin'] })),
      ).toBe(true);
      expect(
        new RolesGuard({
          getAllAndOverride: jest.fn().mockReturnValue(['Admin']),
        } as unknown as Reflector).canActivate(context({ roles: ['Viewer'] })),
      ).toBe(false);

      expect(
        new PermissionsGuard({
          getAllAndOverride: jest.fn().mockReturnValue([]),
        } as unknown as Reflector).canActivate(context()),
      ).toBe(true);
      expect(
        new PermissionsGuard({
          getAllAndOverride: jest
            .fn()
            .mockReturnValue(['users.read', 'users.write']),
        } as unknown as Reflector).canActivate(
          context({ permissions: ['users.read', 'users.write'] }),
        ),
      ).toBe(true);
      expect(
        new PermissionsGuard({
          getAllAndOverride: jest
            .fn()
            .mockReturnValue(['users.read', 'users.write']),
        } as unknown as Reflector).canActivate(
          context({ permissions: ['users.read'] }),
        ),
      ).toBe(false);
      expect(new JwtAuthGuard()).toBeInstanceOf(JwtAuthGuard);
    });
  });

  describe('e2e through real IdentityModule', () => {
    class Store {
      userSeq = 1;
      roleSeq = 1;
      permissionSeq = 1;
      users = new Map<string, UserAccess>();
      roles = new Map<string, RoleWithPermissions>();
      permissions = new Map<
        string,
        { id: string; code: string; description: string | null }
      >();
      userRoles = new Map<string, Set<string>>();

      createPermission(code: string, description: string | null = null) {
        const item = { id: String(this.permissionSeq++), code, description };
        this.permissions.set(item.id, item);
        return item;
      }

      createRole(
        name: string,
        description: string | null = null,
        permissionIds: string[] = [],
      ) {
        const item: RoleWithPermissions = {
          id: String(this.roleSeq++),
          name,
          description,
          permissions: permissionIds.map((id) => ({
            permission: this.permissions.get(id)!,
          })),
        };
        this.roles.set(item.id, item);
        return item;
      }

      withAccess(item: UserAccess): UserAccess {
        return {
          ...item,
          roles: [...(this.userRoles.get(item.id) ?? new Set<string>())]
            .map((id) => this.roles.get(id))
            .filter((item): item is RoleWithPermissions => Boolean(item))
            .map((role) => ({ role })),
        };
      }
    }

    const repos = (store: Store) => ({
      users: {
        async findById(id: string) {
          const item = store.users.get(id);
          return item ? store.withAccess(item) : null;
        },
        async findByEmail(email: string) {
          const item = [...store.users.values()].find(
            (user) => user.email === email,
          );
          return item ? store.withAccess(item) : null;
        },
        async create(input: {
          email: string;
          passwordHash: string;
          name: string;
          avatarUrl?: string | null;
        }) {
          const item = user({
            id: String(store.userSeq++),
            email: input.email,
            passwordHash: input.passwordHash,
            name: input.name,
            avatarUrl: input.avatarUrl ?? null,
          });
          store.users.set(item.id, item);
          return item;
        },
        async getWithAccessById(id: string) {
          const item = store.users.get(id);
          return item ? store.withAccess(item) : null;
        },
        async assignRole(input: { userId: string; roleId: string }) {
          const set = store.userRoles.get(input.userId) ?? new Set<string>();
          set.add(input.roleId);
          store.userRoles.set(input.userId, set);
        },
        async revokeRole(input: { userId: string; roleId: string }) {
          store.userRoles.get(input.userId)?.delete(input.roleId);
        },
      } satisfies IUserRepository,
      roles: {
        async findById(id: string) {
          return store.roles.get(id) ?? null;
        },
        async findByName(name: string) {
          return (
            [...store.roles.values()].find((role) => role.name === name) ?? null
          );
        },
        async list() {
          return [...store.roles.values()];
        },
        async create(input: {
          name: string;
          description?: string | null;
          permissionIds?: string[];
        }) {
          const item = store.createRole(
            input.name,
            input.description ?? null,
            input.permissionIds ?? [],
          );
          return {
            id: item.id,
            name: item.name,
            description: item.description,
          };
        },
        async delete(id: string) {
          store.roles.delete(id);
        },
      } satisfies IRoleRepository,
      permissions: {
        async findById(id: string) {
          return store.permissions.get(id) ?? null;
        },
        async findByCode(code: string) {
          return (
            [...store.permissions.values()].find(
              (item) => item.code === code,
            ) ?? null
          );
        },
        async list() {
          return [...store.permissions.values()];
        },
        async create(input: { code: string; description?: string | null }) {
          return store.createPermission(input.code, input.description ?? null);
        },
      } satisfies IPermissionRepository,
    });

    let app: INestApplication;
    let store: Store;

    beforeEach(async () => {
      process.env.JWT_SECRET = 'identity-e2e-secret';
      store = new Store();
      const repositories = repos(store);
      const moduleRef = await Test.createTestingModule({
        imports: [IdentityModule],
      })
        .overrideProvider(PrismaService)
        .useValue({ $connect: jest.fn(), $disconnect: jest.fn() })
        .overrideProvider(IDENTITY_TOKENS.USER_REPOSITORY)
        .useValue(repositories.users)
        .overrideProvider(IDENTITY_TOKENS.ROLE_REPOSITORY)
        .useValue(repositories.roles)
        .overrideProvider(IDENTITY_TOKENS.PERMISSION_REPOSITORY)
        .useValue(repositories.permissions)
        .overrideProvider(IDENTITY_TOKENS.PASSWORD_HASHER)
        .useValue({
          hash: jest.fn(async (password: string) => `hashed:${password}`),
          compare: jest.fn(
            async (password: string, hash: string) =>
              hash === `hashed:${password}`,
          ),
        })
        .overrideProvider(IDENTITY_TOKENS.TOKEN_SERVICE)
        .useValue({
          sign: (payload: Record<string, unknown>) =>
            new NestJwtService({ secret: 'identity-e2e-secret' }).sign(payload),
        })
        .compile();

      app = moduleRef.createNestApplication();
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    const register = async (email = 'user@example.com') => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123', name: 'User' })
        .expect(201);
      return response.body as {
        user: { id: string; email: string };
        accessToken: string;
      };
    };

    const admin = async () => {
      const permission = store.createPermission('users.manage');
      const adminRole = store.createRole('Admin', null, [permission.id]);
      const adminUser = await register('admin@example.com');
      await repos(store).users.assignRole({
        userId: adminUser.user.id,
        roleId: adminRole.id,
      });
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'password123' })
        .expect(201);
      return { token: login.body.accessToken as string, adminRole };
    };

    it('should cover auth endpoints, admin endpoints and authorization failures', async () => {
      const registered = await register();
      expect(registered.user).toMatchObject({
        id: '1',
        email: 'user@example.com',
      });
      expect(registered.accessToken).toEqual(expect.any(String));

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'bad', password: '123', name: 'A' })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201);
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'wrong-password' })
        .expect(401);

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${registered.accessToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toMatchObject({ id: '1', email: 'user@example.com' });
        });
      await request(app.getHttpServer()).get('/auth/me').expect(401);

      const { token, adminRole } = await admin();
      const target = await register('target@example.com');

      await request(app.getHttpServer())
        .post(`/users/${target.user.id}/roles`)
        .set('Authorization', `Bearer ${registered.accessToken}`)
        .send({ roleId: adminRole.id })
        .expect(403);
      await request(app.getHttpServer())
        .post(`/users/${target.user.id}/roles`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roleId: adminRole.id })
        .expect(201);
      expect(store.userRoles.get(target.user.id)?.has(adminRole.id)).toBe(true);

      await request(app.getHttpServer())
        .delete(`/users/${target.user.id}/roles/${adminRole.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(store.userRoles.get(target.user.id)?.has(adminRole.id)).toBe(
        false,
      );

      await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'reports.read', description: 'Read reports' })
        .expect(201);
      await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Reporter', permissionCodes: ['reports.read'] })
        .expect(201);
      await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      await request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      await request(app.getHttpServer()).get('/roles').expect(401);
    });
  });
});
