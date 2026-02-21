'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@pizza/shared';
import { Package, ArrowUpDown, Clock, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const { data: products } = useQuery({ queryKey: ['admin-products-kpi'], queryFn: adminApi.products.list });
  const { data: inventory } = useQuery({ queryKey: ['admin-inventory-kpi'], queryFn: adminApi.inventory.list });
  const { data: orders } = useQuery({ queryKey: ['admin-orders-kpi'], queryFn: adminApi.orders.listAll });

  const pendingOrders = orders?.filter((o) => ['received', 'confirmed', 'preparing'].includes(o.status)).length ?? 0;

  const cards = [
    { label: 'Produtos', value: products?.total ?? 0, icon: Package, color: 'text-brand-yellow' },
    { label: 'Movimentações', value: inventory?.length ?? 0, icon: ArrowUpDown, color: 'text-blue-400' },
    { label: 'Pedidos pendentes', value: pendingOrders, icon: Clock, color: 'text-orange-400' },
    { label: 'Total de pedidos', value: orders?.length ?? 0, icon: ClipboardList, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Painel</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card-surface p-5 space-y-2">
            <div className="flex items-center gap-2">
              <card.icon size={18} className={card.color} />
              <p className="text-sm text-brand-gray">{card.label}</p>
            </div>
            <p className="text-3xl font-bold text-brand-yellow">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
