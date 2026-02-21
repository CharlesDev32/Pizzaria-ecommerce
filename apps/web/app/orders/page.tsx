'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { formatMoney, ordersApi } from '@pizza/shared';
import { ChevronRight, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { t, orderStatusMap } from '@/lib/i18n';

const statusVariant: Record<string, 'default' | 'secondary' | 'yellow' | 'success' | 'warning' | 'destructive'> = {
  received: 'warning',
  confirmed: 'yellow',
  preparing: 'yellow',
  ready: 'yellow',
  out_for_delivery: 'yellow',
  delivered: 'success',
  canceled: 'destructive',
};

export default function OrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.listMine,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{t.orders_title}</h1>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-navy2" />
          ))}
        </div>
      )}

      {error && (
        <div className="card-surface p-4 text-red-300">
          {t.orders_error}
        </div>
      )}

      {!isLoading && !error && data?.length === 0 && (
        <div className="card-surface flex flex-col items-center gap-4 p-12 text-center">
          <Package size={48} className="text-brand-gray/40" />
          <div>
            <p className="text-lg font-semibold">{t.orders_empty_title}</p>
            <p className="mt-1 text-sm text-brand-gray">{t.orders_empty_desc}</p>
          </div>
          <Link href="/menu" className="rounded-md bg-brand-red px-5 py-2 text-sm font-semibold hover:bg-brand-red2 transition-colors">
            {t.orders_order_now}
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {data?.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <article className="card-surface flex items-center justify-between gap-4 p-4 hover:bg-brand-navy2/70 transition-colors cursor-pointer">
              <div className="space-y-1">
                <p className="font-semibold">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={statusVariant[order.status] ?? 'secondary'}>
                    {orderStatusMap[order.status] ?? order.status}
                  </Badge>
                  {order.items?.length > 0 && (
                    <span className="text-xs text-brand-gray">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-brand-yellow">{formatMoney(order.grandTotal)}</span>
                <ChevronRight size={16} className="text-brand-gray" />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
