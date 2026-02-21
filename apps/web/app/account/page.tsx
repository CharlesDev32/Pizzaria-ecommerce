'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@pizza/shared';
import { useAuthStore } from '@/store/auth.store';
import { User, ClipboardList, MapPin, LogOut, Shield } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function AccountPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { data, isLoading, error } = useQuery({ queryKey: ['me'], queryFn: authApi.me });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{t.account_title}</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-xl bg-brand-navy2" />}

      {error && (
        <div className="card-surface p-6 text-center">
          <p className="text-red-300 mb-4">{t.account_login_required}</p>
          <Link href="/auth/login" className="rounded-md bg-brand-red px-5 py-2 text-sm font-semibold hover:bg-brand-red2 transition-colors">
            {t.auth_login_button}
          </Link>
        </div>
      )}

      {data && (
        <>
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-yellow/10 text-brand-yellow">
                <User size={28} />
              </div>
              <div>
                <p className="text-xl font-bold">{data.name}</p>
                <p className="text-sm text-brand-gray">{data.email}</p>
              </div>
              {data.role === 'ADMIN' && (
                <span className="ml-auto flex items-center gap-1 rounded-full bg-brand-red/20 px-3 py-1 text-xs font-semibold text-brand-red">
                  <Shield size={12} />
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="card-surface divide-y divide-brand overflow-hidden">
            <Link
              href="/orders"
              className="flex items-center justify-between px-6 py-4 hover:bg-brand-navy2/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={20} className="text-brand-yellow" />
                <span className="font-medium">{t.account_orders}</span>
              </div>
              <span className="text-sm text-brand-gray">&rarr;</span>
            </Link>

            <Link
              href="/account/addresses"
              className="flex items-center justify-between px-6 py-4 hover:bg-brand-navy2/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-brand-yellow" />
                <span className="font-medium">{t.account_addresses}</span>
              </div>
              <span className="text-sm text-brand-gray">&rarr;</span>
            </Link>

            {data.role === 'ADMIN' && (
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-6 py-4 hover:bg-brand-navy2/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-brand-yellow" />
                  <span className="font-medium">{t.account_admin_panel}</span>
                </div>
                <span className="text-sm text-brand-gray">&nearr;</span>
              </a>
            )}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-brand-red/10 transition-colors group"
            >
              <LogOut size={20} className="text-brand-gray group-hover:text-brand-red transition-colors" />
              <span className="font-medium group-hover:text-brand-red transition-colors">{t.account_logout}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
