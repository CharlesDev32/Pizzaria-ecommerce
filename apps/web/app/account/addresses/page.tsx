'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesApi, deliveryApi } from '@pizza/shared';
import { ArrowLeft, Plus, MapPin, Star, Pencil, Loader2 } from 'lucide-react';
import { useAuthGuard } from '@/lib/guards/auth.guard';
import { t } from '@/lib/i18n';

const inputClass =
  'flex h-10 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm placeholder:text-brand-gray/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow';

interface AddressForm {
  label: string;
  street: string;
  number: string;
  complement: string;
  neighborhoodId: string;
  reference: string;
  isDefault: boolean;
}

const emptyForm: AddressForm = {
  label: '',
  street: '',
  number: '',
  complement: '',
  neighborhoodId: '',
  reference: '',
  isDefault: false,
};

export default function AddressesPage() {
  const { isReady } = useAuthGuard();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.list,
    enabled: isReady,
  });

  const { data: neighborhoods } = useQuery({
    queryKey: ['neighborhoods'],
    queryFn: deliveryApi.listNeighborhoods,
    enabled: isReady,
  });

  const { data: zones } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: deliveryApi.listZones,
    enabled: isReady,
  });

  const createMutation = useMutation({
    mutationFn: (data: AddressForm) => addressesApi.create({
      label: data.label,
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
      neighborhoodId: data.neighborhoodId,
      reference: data.reference || undefined,
      isDefault: data.isDefault,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressForm> }) =>
      addressesApi.update(id, {
        label: data.label,
        street: data.street,
        number: data.number,
        complement: data.complement || undefined,
        neighborhoodId: data.neighborhoodId,
        reference: data.reference || undefined,
        isDefault: data.isDefault,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setEditingId(null);
      setShowForm(false);
      setForm(emptyForm);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (addr: typeof addresses extends (infer U)[] | undefined ? U : never) => {
    if (!addr) return;
    setForm({
      label: addr.label,
      street: addr.street,
      number: addr.number,
      complement: addr.complement ?? '',
      neighborhoodId: addr.neighborhoodId,
      reference: addr.reference ?? '',
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const zoneMap = new Map(zones?.map((z) => [z.id, z.name]) ?? []);

  if (!isReady) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-brand-yellow" size={32} /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account" className="rounded-md p-2 hover:bg-brand-navy2 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{t.address_title}</h1>
      </div>

      {!showForm && (
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-md bg-brand-red px-4 py-2 text-sm font-semibold hover:bg-brand-red2 transition-colors"
        >
          <Plus size={16} />
          {t.address_new}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-6">
          <h2 className="font-semibold">{editingId ? t.address_edit : t.address_new}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-brand-gray">{t.address_label}</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={inputClass} placeholder="Casa, Trabalho..." required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brand-gray">{t.address_street}</label>
              <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className={inputClass} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brand-gray">{t.address_number}</label>
              <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className={inputClass} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brand-gray">{t.address_complement}</label>
              <input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-brand-gray">{t.address_neighborhood}</label>
              <select
                value={form.neighborhoodId}
                onChange={(e) => setForm({ ...form, neighborhoodId: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Selecionar bairro...</option>
                {neighborhoods?.filter((n) => n.isActive).map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} {zoneMap.get(n.deliveryZoneId) ? `(${zoneMap.get(n.deliveryZoneId)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-brand-gray">{t.address_reference}</label>
              <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            {t.address_set_default}
          </label>
          <div className="flex gap-3">
            <button type="submit" className="rounded-md bg-brand-red px-6 py-2 font-semibold hover:bg-brand-red2 transition-colors" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? t.loading : t.address_save}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-md border border-brand px-6 py-2 text-sm hover:bg-brand-navy2 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-navy2" />)}
        </div>
      )}

      {!isLoading && addresses?.length === 0 && !showForm && (
        <div className="card-surface p-8 text-center text-brand-gray">
          {t.address_empty}
        </div>
      )}

      <div className="space-y-3">
        {addresses?.map((addr) => (
          <div key={addr.id} className="card-surface flex items-center justify-between p-4">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-brand-yellow shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{addr.label}</p>
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 rounded bg-brand-yellow/20 px-2 py-0.5 text-xs font-medium text-brand-yellow">
                      <Star size={10} />
                      {t.address_default_badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-brand-gray">
                  {addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => startEdit(addr)}
              className="rounded-md p-2 text-brand-gray hover:bg-brand-navy2 hover:text-brand-yellow transition-colors"
            >
              <Pencil size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
