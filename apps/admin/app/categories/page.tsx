'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@pizza/shared';
import { AdminTable } from '@/components/tables/AdminTable';
import { Plus } from 'lucide-react';

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: adminApi.categories.list });

  async function create() {
    if (!name) return;
    const autoSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
    await adminApi.categories.create({ name, slug: autoSlug });
    setName(''); setSlug('');
    await qc.invalidateQueries({ queryKey: ['admin-categories'] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Categorias</h1>
      <div className="card-surface grid gap-2 p-4 md:grid-cols-3">
        <input className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm" placeholder="Nome da categoria" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm" placeholder="Slug (opcional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button className="flex items-center justify-center gap-2 rounded-md bg-brand-red px-4 py-2 font-semibold hover:bg-brand-red2 transition-colors" onClick={create}>
          <Plus size={16} /> Criar categoria
        </button>
      </div>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />
      ) : (
        <AdminTable rows={data ?? []} columns={[{ key: 'id', label: 'ID' }, { key: 'name', label: 'Nome' }, { key: 'slug', label: 'Slug' }]} />
      )}
    </div>
  );
}
