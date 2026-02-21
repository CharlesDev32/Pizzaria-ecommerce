import { AuthTokens, UserProfile } from '../types/auth.types';
import { apiRequest } from './client';

export const authApi = {
  register: (input: { email: string; password: string; name: string }) =>
    apiRequest<UserProfile>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) =>
    apiRequest<AuthTokens>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  refresh: (refreshToken: string) =>
    apiRequest<AuthTokens>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  logout: () => apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  me: () => apiRequest<UserProfile>('/users/me'),
};
