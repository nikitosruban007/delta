import { RegisterUseCase } from './register.use-case';
import { EmailAlreadyExistsError } from '../errors/email-already-exists.error';
import type { IUserRepository } from '../ports/user-repository.port';
import type { IPasswordHasher } from '../ports/password-hasher.port';
import type { ITokenService } from '../ports/token-service.port';

const mockUser = {
  id: '1',
  email: 'test@example.com',
  passwordHash: 'hashed',
  name: 'Test User',
  avatarUrl: null,
  isActive: true,
  roles: [],
};

describe('RegisterUseCase', () => {
  let users: jest.Mocked<IUserRepository>;
  let hasher: jest.Mocked<IPasswordHasher>;
  let tokenService: jest.Mocked<ITokenService>;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      getWithAccessById: jest.fn(),
      assignRole: jest.fn(),
      revokeRole: jest.fn(),
    };

    hasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    tokenService = {
      sign: jest.fn(),
    };

    useCase = new RegisterUseCase(users, hasher, tokenService);
  });

  it('throws EmailAlreadyExistsError if email is taken', async () => {
    users.findByEmail.mockResolvedValue(mockUser);

    await expect(
      useCase.execute({
        email: 'test@example.com',
        password: 'pass123',
        name: 'Test',
      }),
    ).rejects.toThrow(EmailAlreadyExistsError);
  });

  it('creates user and returns token on success', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue(mockUser);
    users.getWithAccessById.mockResolvedValue({ ...mockUser, roles: [] });
    hasher.hash.mockResolvedValue('hashed_password');
    tokenService.sign.mockReturnValue('jwt_token');

    const result = await useCase.execute({
      email: 'new@example.com',
      password: 'pass123',
      name: 'New User',
    });

    expect(result.accessToken).toBe('jwt_token');
    expect(result.user.email).toBe('test@example.com');
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@example.com' }),
    );
  });

  it('calls hasher with the provided password', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue(mockUser);
    users.getWithAccessById.mockResolvedValue({ ...mockUser, roles: [] });
    hasher.hash.mockResolvedValue('hashed');
    tokenService.sign.mockReturnValue('token');

    await useCase.execute({
      email: 'a@b.com',
      password: 'mypassword',
      name: 'User',
    });

    expect(hasher.hash).toHaveBeenCalledWith('mypassword');
  });
});
