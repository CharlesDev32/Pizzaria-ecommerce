'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string | null, refresh: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (accessToken, refreshToken) => set(() => ({ accessToken, refreshToken })),
      logout: () => set(() => ({ accessToken: null, refreshToken: null })),
    }),
    { name: 'pizza-auth' },
  ),
);
