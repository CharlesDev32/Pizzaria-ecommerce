'use client';

import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, formatMoney } from '@pizza/shared';

const statusMap: Record<string, string> = {
  received: 'Recebido',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Pronto',
  out_for_delivery: 'Saiu p/ entrega',
  delivered: 'Entregue',
  canceled: 'Cancelado',
};

const statusFlow = ['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: () => adminApi.orders.listAll().then((list) => list.find((o) => o.id === id)),
    refetchInterval: 10_000,
  });

  async function updateStatus(status: string) {
    await adminApi.orders.updateStatus(id, status);
    await qc.invalidateQueries({ queryKey: ['admin-order-detail', id] });
    await qc.invalidateQueries({ queryKey: ['admin-orders'] });
  }

  if (isLoading) return <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />;
  if (!data) return <div className="card-surface p-6 text-center text-brand-gray">Pedido não encontrado.</div>;

  const currentIdx = statusFlow.indexOf(data.status);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Pedido #{data.id.slice(0, 8)}</h1>

      {/* Progress bar */}
      <div className="card-surface p-4">
        <div className="flex items-center justify-between text-xs">
          {statusFlow.map((s, i) => {
            const done = i <= currentIdx && data.status !== 'canceled';
            return (
              <div key={s} className="flex flex-1 flex-col items-center gap-1">
                <div className={`h-3 w-3 rounded-full ${done ? 'bg-brand-yellow' : 'bg-brand-navy2'}`} />
                <span className={done ? 'text-brand-yellow font-medium' : 'text-brand-gray'}>{statusMap[s]}</span>
              </div>
            );
          })}
        </div>
        {data.status === 'canceled' && (
          <p className="mt-3 text-center text-sm text-red-400 font-medium">Pedido cancelado</p>
        )}
      </div>

      {/* Order info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-surface space-y-2 p-4">
          <h2 className="text-lg font-semibold text-brand-yellow">Informações</h2>
          <p className="text-sm"><span className="text-brand-gray">Status:</span> {statusMap[data.status] ?? data.status}</p>
          {data.timeline?.[0] && <p className="text-sm"><span className="text-brand-gray">Criado em:</span> {new Date(data.timeline[0].createdAt).toLocaleString('pt-BR')}</p>}
          {data.paymentMethod && <p className="text-sm"><span className="text-brand-gray">Pagamento:</span> {data.paymentMethod === 'cash_on_delivery' ? 'Dinheiro na entrega' : 'Cartão na entrega'}</p>}
          {data.notes && <p className="text-sm"><span className="text-brand-gray">Observações:</span> {data.notes}</p>}
        </div>

        {data.addressSnapshot && (
          <div className="card-surface space-y-2 p-4">
            <h2 className="text-lg font-semibold text-brand-yellow">Endereço</h2>
            <p className="text-sm">{data.addressSnapshot.street}, {data.addressSnapshot.number}</p>
            {data.addressSnapshot.complement && <p className="text-sm text-brand-gray">{data.addressSnapshot.complement}</p>}
            <p className="text-sm">{data.addressSnapshot.neighborhoodName}</p>
          </div>
        )}
      </div>

      {/* Items */}
      {data.items && data.items.length > 0 && (
        <div className="card-surface space-y-2 p-4">
          <h2 className="text-lg font-semibold text-brand-yellow">Itens</h2>
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between border-b border-brand-navy2 py-2 last:border-0">
              <div>
                <p className="text-sm font-medium">{item.titleSnapshot ?? `Produto ${item.productId?.slice(0, 8)}`}</p>
                <p className="text-xs text-brand-gray">Qtd: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatMoney(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="card-surface space-y-1 p-4">
        <div className="flex justify-between text-sm"><span className="text-brand-gray">Subtotal</span><span>{formatMoney(data.subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span className="text-brand-gray">Taxa de entrega</span><span>{formatMoney(data.deliveryFee)}</span></div>
        {data.discountTotal > 0 && <div className="flex justify-between text-sm"><span className="text-brand-gray">Desconto</span><span className="text-green-400">-{formatMoney(data.discountTotal)}</span></div>}
        <div className="flex justify-between text-base font-bold pt-1 border-t border-brand-navy2"><span>Total</span><span className="text-brand-yellow">{formatMoney(data.grandTotal)}</span></div>
      </div>

      {/* Status actions */}
      <div className="card-surface space-y-3 p-4">
        <h2 className="text-lg font-semibold text-brand-yellow">Alterar status</h2>
        <div className="grid gap-2 md:grid-cols-4">
          {statusFlow.map((status) => (
            <button
              key={status}
              disabled={data.status === status}
              className={`rounded-md border border-brand px-3 py-2 text-sm font-medium transition-colors ${data.status === status ? 'bg-brand-yellow text-brand-dark cursor-default' : 'hover:bg-brand-navy2'}`}
              onClick={() => updateStatus(status)}
            >
              {statusMap[status]}
            </button>
          ))}
          <button
            disabled={data.status === 'canceled'}
            className={`rounded-md border border-red-500/50 px-3 py-2 text-sm font-medium text-red-400 transition-colors ${data.status === 'canceled' ? 'opacity-50 cursor-default' : 'hover:bg-red-500/10'}`}
            onClick={() => updateStatus('canceled')}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
