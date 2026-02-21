'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminApi, authApi } from '@pizza/shared';
import { useAdminAuthStore } from '@/store/admin-auth.store';
import { LogOut, User } from 'lucide-react';

export function AdminHeader() {
  const router = useRouter();
  const logout = useAdminAuthStore((s) => s.logout);
  const { data: user } = useQuery({ queryKey: ['admin-me'], queryFn: adminApi.users.me });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between rounded-2xl border border-brand bg-brand-navy2/85 px-5 py-3">
      <p className="text-[11px] font-heading uppercase tracking-[0.18em] text-brand-gray">Painel Administrativo</p>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-brand-yellow" />
            <span className="text-brand-white font-medium">{user.name}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-heading uppercase tracking-[0.12em] text-brand-gray hover:bg-brand-red/20 hover:text-brand-yellow transition-colors"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </header>
  );
}
