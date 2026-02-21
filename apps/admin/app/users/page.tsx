'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@pizza/shared';
import { User } from 'lucide-react';

export default function UsersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-users-me'], queryFn: adminApi.users.me });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Usuários</h1>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />
      ) : (
        <div className="card-surface p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy2">
              <User size={24} className="text-brand-yellow" />
            </div>
            <div>
              <p className="text-lg font-semibold">{data?.name ?? '-'}</p>
              <p className="text-sm text-brand-gray">{data?.email ?? '-'}</p>
              {data?.role && <p className="text-xs text-brand-yellow mt-1">{data.role === 'ADMIN' ? 'Administrador' : data.role}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
