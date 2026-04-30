export interface CurrentUserContext {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface ICurrentUserProvider {
  getCurrentUser(): Promise<CurrentUserContext>;
}
