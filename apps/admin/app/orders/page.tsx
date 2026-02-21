'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@pizza/shared';
import { ClipboardList } from 'lucide-react';

const statusMap: Record<string, { label: string; color: string }> = {
  received: { label: 'Recebido', color: 'bg-blue-500/20 text-blue-300' },
  confirmed: { label: 'Confirmado', color: 'bg-cyan-500/20 text-cyan-300' },
  preparing: { label: 'Preparando', color: 'bg-yellow-500/20 text-yellow-300' },
  ready: { label: 'Pronto', color: 'bg-orange-500/20 text-orange-300' },
  out_for_delivery: { label: 'Saiu p/ entrega', color: 'bg-purple-500/20 text-purple-300' },
  delivered: { label: 'Entregue', color: 'bg-green-500/20 text-green-300' },
  canceled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-300' },
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-orders'], queryFn: adminApi.orders.listAll });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Pedidos</h1>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />
      ) : !data?.length ? (
        <div className="card-surface p-8 text-center text-brand-gray">Nenhum pedido encontrado.</div>
      ) : (
        <div className="space-y-2">
          {data.map((order) => {
            const st = statusMap[order.status] ?? { label: order.status, color: 'bg-brand-navy2 text-brand-gray' };
            return (
              <Link key={order.id} href={`/orders/${order.id}`} className="card-surface flex items-center justify-between p-4 hover:bg-brand-navy transition-colors">
                <div className="flex items-center gap-3">
                  <ClipboardList size={18} className="text-brand-yellow" />
                  <div>
                    <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                    {order.timeline?.[0] && <p className="text-xs text-brand-gray">{new Date(order.timeline[0].createdAt).toLocaleString('pt-BR')}</p>}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${st.color}`}>{st.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
