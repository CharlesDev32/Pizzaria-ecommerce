'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function useAuthGuard(redirectTo = '/auth/login'): { isReady: boolean } {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Se já tem token, está pronto
    if (token) {
      setIsReady(true);
      return;
    }

    // Espera hidratação do Zustand persist
    const timeout = setTimeout(() => {
      const currentToken = useAuthStore.getState().accessToken;
      if (!currentToken) {
        router.push(redirectTo);
      } else {
        setIsReady(true);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [token, redirectTo, router]);

  return { isReady };
}
