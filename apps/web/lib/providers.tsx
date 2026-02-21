'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { registerTokenHandlers } from '@pizza/shared';
import { useAuthStore } from '@/store/auth.store';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  registerTokenHandlers(
    () => ({ accessToken: useAuthStore.getState().accessToken, refreshToken: useAuthStore.getState().refreshToken }),
    (tokens) => useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken),
    () => useAuthStore.getState().logout(),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
