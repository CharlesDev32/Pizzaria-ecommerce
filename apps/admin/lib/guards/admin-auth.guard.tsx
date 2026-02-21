'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/admin-auth.store';

export function useAdminAuthGuard(redirectTo = '/login'): { isReady: boolean } {
  const router = useRouter();
  const token = useAdminAuthStore((s) => s.accessToken);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (token) {
      setIsReady(true);
      return;
    }

    const timeout = setTimeout(() => {
      const currentToken = useAdminAuthStore.getState().accessToken;
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
