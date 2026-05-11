import { UserAccess } from '../types/user-access.type';

export interface CreateUserInput {
  email: string;
  passwordHash?: string | null;
  name: string;
  avatarUrl?: string | null;
  googleId?: string | null;
  githubId?: string | null;
}

export interface IUserRepository {
  findById(id: string): Promise<UserAccess | null>;
  findByEmail(email: string): Promise<UserAccess | null>;
  findByGoogleId(googleId: string): Promise<UserAccess | null>;
  findByGithubId(githubId: string): Promise<UserAccess | null>;
  create(input: CreateUserInput): Promise<UserAccess>;

  linkSocialAccount(input: {
    userId: string;
    provider: 'google' | 'github';
    providerId: string;
  }): Promise<UserAccess>;

  getWithAccessById(id: string): Promise<UserAccess | null>;

  assignRole(input: {
    userId: string;
    roleId: string;
    assignedBy?: string | null;
  }): Promise<void>;

  revokeRole(input: {
    userId: string;
    roleId: string;
  }): Promise<void>;
}
