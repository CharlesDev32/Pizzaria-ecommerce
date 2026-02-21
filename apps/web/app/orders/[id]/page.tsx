'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { formatMoney, ordersApi } from '@pizza/shared';
import { ArrowLeft, Package, CheckCircle2, Clock, Truck, MapPin, CreditCard, MessageSquare } from 'lucide-react';
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

const timelineIcon: Record<string, typeof Package> = {
  confirmed: CheckCircle2,
  preparing: Package,
  ready: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
};

const ALL_STATUSES = ['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'delivered' || status === 'canceled') return false;
      return 10_000;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-brand-navy2" />
        <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />
        <div className="h-60 animate-pulse rounded-xl bg-brand-navy2" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-red-300 mb-4">{t.orders_not_found}</p>
        <Link href="/orders" className="text-sm text-brand-yellow hover:underline">
          {t.orders_back}
        </Link>
      </div>
    );
  }

  const currentIdx = ALL_STATUSES.indexOf(order.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/orders" className="rounded-md p-2 hover:bg-brand-navy2 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          Pedido #{order.id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      {/* Progress bar */}
      {order.status !== 'canceled' && (
        <div className="card-surface p-5 space-y-3">
          <div className="flex justify-between text-xs text-brand-gray">
            {ALL_STATUSES.map((s, i) => (
              <span key={s} className={i <= currentIdx ? 'text-brand-yellow font-semibold' : ''}>
                {orderStatusMap[s] ?? s}
              </span>
            ))}
          </div>
          <div className="h-2 rounded-full bg-brand-navy overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-yellow transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / ALL_STATUSES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Status + Total */}
      <div className="card-surface flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-brand-gray">Status</p>
          <Badge variant={statusVariant[order.status] ?? 'secondary'} className="text-sm px-3 py-1">
            {orderStatusMap[order.status] ?? order.status}
          </Badge>
        </div>
        <div className="text-right space-y-1">
          <p className="text-sm text-brand-gray">Total</p>
          <p className="text-2xl font-bold text-brand-yellow">{formatMoney(order.grandTotal)}</p>
        </div>
      </div>

      {/* Address + Payment info */}
      {order.addressSnapshot && (
        <div className="card-surface p-5 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-brand-yellow shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">{order.addressSnapshot.label}</p>
              <p className="text-brand-gray">
                {order.addressSnapshot.street}, {order.addressSnapshot.number}
                {order.addressSnapshot.complement && ` - ${order.addressSnapshot.complement}`}
              </p>
              <p className="text-brand-gray">{order.addressSnapshot.neighborhoodName} ({order.addressSnapshot.zoneName})</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-brand-yellow shrink-0" />
            <span className="text-sm">{order.paymentMethod === 'cash_on_delivery' ? 'Dinheiro na entrega' : 'Cartão na entrega'}</span>
            {order.changeFor && <span className="text-xs text-brand-gray">(Troco para {formatMoney(order.changeFor)})</span>}
          </div>
          {order.notes && (
            <div className="flex items-start gap-3">
              <MessageSquare size={18} className="text-brand-yellow shrink-0 mt-0.5" />
              <p className="text-sm text-brand-gray">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="card-surface overflow-hidden">
        <div className="border-b border-brand px-5 py-4">
          <h2 className="font-semibold">{t.orders_items}</h2>
        </div>
        <div className="divide-y divide-brand">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium">{item.titleSnapshot}</p>
                <p className="text-sm text-brand-gray">
                  {formatMoney(item.unitPrice)} &times; {item.quantity}
                </p>
                {item.options && item.options.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.options.map((opt) => (
                      <span key={opt.optionId} className="rounded bg-brand-navy px-2 py-0.5 text-xs text-brand-gray">
                        {opt.optionName}{opt.priceDelta > 0 && ` +${formatMoney(opt.priceDelta)}`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="font-semibold text-brand-yellow">{formatMoney(item.lineTotal)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-brand px-5 py-4 space-y-2 text-sm">
          <div className="flex justify-between text-brand-gray">
            <span>{t.cart_subtotal}</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between text-green-400">
              <span>{t.cart_discount}</span>
              <span>-{formatMoney(order.discountTotal)}</span>
            </div>
          )}
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-brand-gray">
              <span>{t.cart_delivery_fee}</span>
              <span>{formatMoney(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-brand-yellow text-base pt-1 border-t border-brand">
            <span>{t.cart_total}</span>
            <span>{formatMoney(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {order.timeline?.length > 0 && (
        <div className="card-surface overflow-hidden">
          <div className="border-b border-brand px-5 py-4">
            <h2 className="font-semibold">{t.orders_timeline}</h2>
          </div>
          <div className="px-5 py-4 space-y-0">
            {order.timeline.map((event, i) => {
              const Icon = timelineIcon[event.toStatus] ?? Clock;
              const isLast = i === order.timeline.length - 1;
              return (
                <div key={event.id} className="flex items-start gap-4 relative">
                  {!isLast && (
                    <div className="absolute left-4 top-8 w-px h-[calc(100%)] bg-brand" />
                  )}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full z-10 ${isLast ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-brand-navy text-brand-gray'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`font-medium ${isLast ? 'text-brand-yellow' : 'text-brand-gray'}`}>
                      {orderStatusMap[event.toStatus] ?? event.toStatus}
                    </p>
                    <p className="text-xs text-brand-gray">
                      {new Date(event.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Link
        href="/orders"
        className="flex items-center gap-2 text-sm text-brand-yellow hover:underline"
      >
        <ArrowLeft size={14} />
        {t.orders_detail_back}
      </Link>
    </div>
  );
}
