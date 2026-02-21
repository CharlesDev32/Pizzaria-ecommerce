export type Role = 'ADMIN' | 'CUSTOMER';

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
}
