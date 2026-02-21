'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@pizza/shared';
import { AdminTable } from '@/components/tables/AdminTable';
import { ArrowUpDown } from 'lucide-react';

export default function InventoryPage() {
  const qc = useQueryClient();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [type, setType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const { data, isLoading } = useQuery({ queryKey: ['admin-inventory'], queryFn: adminApi.inventory.list });

  async function move() {
    if (!productId) return;
    await adminApi.inventory.move({ productId, quantity: Number(quantity), type });
    setProductId('');
    setQuantity('1');
    await qc.invalidateQueries({ queryKey: ['admin-inventory'] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Estoque</h1>
      <div className="card-surface grid gap-2 p-4 md:grid-cols-4">
        <input className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm" placeholder="ID do Produto" value={productId} onChange={(e) => setProductId(e.target.value)} />
        <select className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT')}>
          <option value="IN">Entrada</option>
          <option value="OUT">Saída</option>
          <option value="ADJUSTMENT">Ajuste</option>
        </select>
        <input className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm" placeholder="Quantidade" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <button className="flex items-center justify-center gap-2 rounded-md bg-brand-red px-4 py-2 font-semibold hover:bg-brand-red2 transition-colors" onClick={move}>
          <ArrowUpDown size={16} /> Aplicar movimentação
        </button>
      </div>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />
      ) : (
        <AdminTable rows={data ?? []} columns={[{ key: 'id', label: 'ID' }, { key: 'productId', label: 'Produto' }, { key: 'type', label: 'Tipo' }, { key: 'quantity', label: 'Qtd' }]} />
      )}
    </div>
  );
}
