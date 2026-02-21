'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerTokenHandlers } from '@pizza/shared';
import { useAdminAuthStore } from '@/store/admin-auth.store';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  registerTokenHandlers(
    () => ({ accessToken: useAdminAuthStore.getState().accessToken, refreshToken: useAdminAuthStore.getState().refreshToken }),
    (tokens) => useAdminAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken),
    () => useAdminAuthStore.getState().logout(),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}