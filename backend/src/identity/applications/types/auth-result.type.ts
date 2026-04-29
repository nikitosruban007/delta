export type AuthResult = {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    roles: string[];
    permissions: string[];
  };
  accessToken: string;
};
