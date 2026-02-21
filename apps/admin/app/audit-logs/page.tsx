'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@pizza/shared';
import { AdminTable } from '@/components/tables/AdminTable';

export default function AuditLogsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-audit'], queryFn: adminApi.audit.list });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Logs de Auditoria</h1>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />
      ) : (
        <AdminTable rows={data?.data ?? []} columns={[{ key: 'id', label: 'ID' }, { key: 'action', label: 'Ação' }, { key: 'resourceType', label: 'Recurso' }, { key: 'createdAt', label: 'Data' }]} />
      )}
    </div>
  );
}
