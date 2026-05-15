import { PermissionNotFoundError } from '../errors/permission-not-found.error';
import { IPermissionRepository } from '../ports/permission-repository.port';
import { IRoleRepository } from '../ports/role-repository.port';
import { CreateRoleUseCase } from './create-role.use-case';

describe('CreateRoleUseCase', () => {
  const createRoleRepository = (): jest.Mocked<IRoleRepository> => ({
    findById: jest.fn(),
    findByName: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  });

  const createPermissionRepository =
    (): jest.Mocked<IPermissionRepository> => ({
      findById: jest.fn(),
      findByCode: jest.fn(),
      list: jest.fn(),
      create: jest.fn(),
    });

  it('persists validated permission ids when permissionCodes are provided', async () => {
    const roles = createRoleRepository();
    const permissions = createPermissionRepository();

    permissions.findByCode
      .mockResolvedValueOnce({
        id: '10',
        code: 'users.read',
        description: null,
      })
      .mockResolvedValueOnce({
        id: '11',
        code: 'users.write',
        description: null,
      });

    roles.create.mockResolvedValue({
      id: '1',
      name: 'Admin',
      description: null,
    });

    const useCase = new CreateRoleUseCase(roles, permissions);

    await expect(
      useCase.execute({
        name: 'Admin',
        permissionCodes: ['users.read', 'users.write'],
      }),
    ).resolves.toEqual({
      id: '1',
      name: 'Admin',
      description: null,
    });

    expect(roles.create).toHaveBeenCalledWith({
      name: 'Admin',
      description: null,
      permissionIds: ['10', '11'],
    });
  });

  it('throws when any requested permission code is missing', async () => {
    const roles = createRoleRepository();
    const permissions = createPermissionRepository();

    permissions.findByCode.mockResolvedValue(null);

    const useCase = new CreateRoleUseCase(roles, permissions);

    await expect(
      useCase.execute({
        name: 'Admin',
        permissionCodes: ['users.read'],
      }),
    ).rejects.toBeInstanceOf(PermissionNotFoundError);
  });
});
