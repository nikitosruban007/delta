import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PermissionsGuard } from './permissions.guard';
import { RolesGuard } from './roles.guard';

describe('identity guards', () => {
  const createExecutionContext = (user: {
    roles?: string[];
    permissions?: string[];
  }): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('RolesGuard allows users with at least one required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['Admin']),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate(
        createExecutionContext({
          roles: ['Admin', 'Reviewer'],
        }),
      ),
    ).toBe(true);
    expect((reflector.getAllAndOverride as jest.Mock).mock.calls[0][0]).toBe(
      ROLES_KEY,
    );
  });

  it('PermissionsGuard rejects users missing required permissions', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue(['users.read', 'users.write']),
    } as unknown as Reflector;

    const guard = new PermissionsGuard(reflector);

    expect(
      guard.canActivate(
        createExecutionContext({
          permissions: ['users.read'],
        }),
      ),
    ).toBe(false);
    expect((reflector.getAllAndOverride as jest.Mock).mock.calls[0][0]).toBe(
      PERMISSIONS_KEY,
    );
  });
});
