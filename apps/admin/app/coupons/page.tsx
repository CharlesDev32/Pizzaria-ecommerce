'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@pizza/shared';
import { Ticket } from 'lucide-react';

export default function CouponsPage() {
  const qc = useQueryClient();
  const [code, setCode] = useState('');
  const [value, setValue] = useState('10');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const { data, isLoading } = useQuery({ queryKey: ['admin-coupons'], queryFn: adminApi.coupons.list });

  async function create() {
    if (!code) return;
    await adminApi.coupons.create({ id: '', code, type, value: Number(value) });
    setCode('');
    await qc.invalidateQueries({ queryKey: ['admin-coupons'] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Cupons</h1>
      <div className="card-surface grid gap-2 p-4 md:grid-cols-4">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código do cupom" className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')} className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm">
          <option value="percentage">Porcentagem (%)</option>
          <option value="fixed">Valor fixo (R$)</option>
        </select>
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valor" className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm" />
        <button className="flex items-center justify-center gap-2 rounded-md bg-brand-red px-4 py-2 font-semibold hover:bg-brand-red2 transition-colors" onClick={create}>
          <Ticket size={16} /> Criar cupom
        </button>
      </div>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />
      ) : !data?.length ? (
        <div className="card-surface p-6 text-center text-brand-gray">Nenhum cupom cadastrado.</div>
      ) : (
        <div className="space-y-2">
          {data.map((c) => (
            <div key={c.id} className="card-surface flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Ticket size={18} className="text-brand-yellow" />
                <div>
                  <p className="font-semibold">{c.code}</p>
                  <p className="text-xs text-brand-gray">{c.type === 'percentage' ? 'Porcentagem' : 'Valor fixo'}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-brand-yellow">
                {c.type === 'percentage' ? `${c.value}%` : `R$ ${c.value}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
