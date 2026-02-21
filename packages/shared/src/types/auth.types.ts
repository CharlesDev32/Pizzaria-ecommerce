export type Role = 'ADMIN' | 'CUSTOMER';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
}
