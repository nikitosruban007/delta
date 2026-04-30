import { EmailAlreadyExistsError } from '../errors/email-already-exists.error';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { IPasswordHasher } from '../ports/password-hasher.port';
import { ITokenService } from '../ports/token-service.port';
import { IUserRepository } from '../ports/user-repository.port';
import { LoginUseCase } from './login.use-case';
import { RegisterUseCase } from './register.use-case';

describe('auth use cases', () => {
  const createUserRepository = (): jest.Mocked<IUserRepository> => ({
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    getWithAccessById: jest.fn(),
    assignRole: jest.fn(),
    revokeRole: jest.fn(),
  });

  const createHasher = (): jest.Mocked<IPasswordHasher> => ({
    hash: jest.fn(),
    compare: jest.fn(),
  });

  const createTokenService = (): jest.Mocked<ITokenService> => ({
    sign: jest.fn(),
  });

  it('RegisterUseCase creates user and returns auth payload', async () => {
    const users = createUserRepository();
    const hasher = createHasher();
    const tokenService = createTokenService();

    users.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue('hashed-password');
    users.create.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
      name: 'User',
      avatarUrl: null,
      isActive: true,
      roles: [],
    });
    users.getWithAccessById.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
      name: 'User',
      avatarUrl: null,
      isActive: true,
      roles: [
        {
          role: {
            id: '7',
            name: 'Admin',
            description: null,
            permissions: [
              {
                permission: {
                  id: '9',
                  code: 'users.read',
                  description: null,
                },
              },
            ],
          },
        },
      ],
    });
    tokenService.sign.mockResolvedValue('access-token');

    const useCase = new RegisterUseCase(users, hasher, tokenService);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'password123',
        name: 'User',
      }),
    ).resolves.toEqual({
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'User',
        avatarUrl: null,
        roles: ['Admin'],
        permissions: ['users.read'],
      },
      accessToken: 'access-token',
    });
  });

  it('RegisterUseCase rejects duplicate email', async () => {
    const users = createUserRepository();
    const hasher = createHasher();
    const tokenService = createTokenService();

    users.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
      name: 'User',
      avatarUrl: null,
      isActive: true,
      roles: [],
    });

    const useCase = new RegisterUseCase(users, hasher, tokenService);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'password123',
        name: 'User',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
  });

  it('LoginUseCase returns roles and permissions for valid credentials', async () => {
    const users = createUserRepository();
    const hasher = createHasher();
    const tokenService = createTokenService();

    users.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
      name: 'User',
      avatarUrl: 'https://example.com/avatar.png',
      isActive: true,
      roles: [],
    });
    hasher.compare.mockResolvedValue(true);
    users.getWithAccessById.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
      name: 'User',
      avatarUrl: 'https://example.com/avatar.png',
      isActive: true,
      roles: [
        {
          role: {
            id: '2',
            name: 'Admin',
            description: null,
            permissions: [
              {
                permission: {
                  id: '3',
                  code: 'users.read',
                  description: null,
                },
              },
              {
                permission: {
                  id: '4',
                  code: 'users.write',
                  description: null,
                },
              },
            ],
          },
        },
      ],
    });
    tokenService.sign.mockResolvedValue('access-token');

    const useCase = new LoginUseCase(users, hasher, tokenService);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'User',
        avatarUrl: 'https://example.com/avatar.png',
        roles: ['Admin'],
        permissions: ['users.read', 'users.write'],
      },
      accessToken: 'access-token',
    });
  });

  it('LoginUseCase rejects invalid credentials', async () => {
    const users = createUserRepository();
    const hasher = createHasher();
    const tokenService = createTokenService();

    users.findByEmail.mockResolvedValue({
      id: '1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
      name: 'User',
      avatarUrl: null,
      isActive: true,
      roles: [],
    });
    hasher.compare.mockResolvedValue(false);

    const useCase = new LoginUseCase(users, hasher, tokenService);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
