import { UserAccess } from '../types/user-access.type';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string | null;
}

export interface IUserRepository {
  findById(id: string): Promise<UserAccess | null>;
  findByEmail(email: string): Promise<UserAccess | null>;
  create(input: CreateUserInput): Promise<UserAccess>;

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
