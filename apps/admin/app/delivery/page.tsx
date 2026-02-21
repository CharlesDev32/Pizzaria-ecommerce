'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, deliveryApi } from '@pizza/shared';

export default function DeliveryPage() {
  const qc = useQueryClient();
  const { data: zones } = useQuery({ queryKey: ['delivery-zones'], queryFn: deliveryApi.listZones });
  const { data: neighborhoods } = useQuery({ queryKey: ['delivery-neighborhoods'], queryFn: deliveryApi.listNeighborhoods });
  const { data: slots } = useQuery({ queryKey: ['delivery-slots'], queryFn: () => deliveryApi.listSlots() });

  const [zoneName, setZoneName] = useState('');
  const [zoneFee, setZoneFee] = useState('8');
  const [zoneMin, setZoneMin] = useState('25');
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const [neighborhoodZoneId, setNeighborhoodZoneId] = useState('');
  const [slotStartAt, setSlotStartAt] = useState('');
  const [slotEndAt, setSlotEndAt] = useState('');
  const [slotCapacity, setSlotCapacity] = useState('12');

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ['delivery-zones'] });
    await qc.invalidateQueries({ queryKey: ['delivery-neighborhoods'] });
    await qc.invalidateQueries({ queryKey: ['delivery-slots'] });
  };

  const zoneMutation = useMutation({
    mutationFn: () => adminApi.delivery.createZone({ name: zoneName, fee: Number(zoneFee), minOrderValue: Number(zoneMin) }),
    onSuccess: refresh,
  });
  const neighborhoodMutation = useMutation({
    mutationFn: () => adminApi.delivery.createNeighborhood({ name: neighborhoodName, deliveryZoneId: neighborhoodZoneId }),
    onSuccess: refresh,
  });
  const slotMutation = useMutation({
    mutationFn: () => adminApi.delivery.createSlot({ startAt: slotStartAt, endAt: slotEndAt, capacity: Number(slotCapacity) }),
    onSuccess: refresh,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Operação de Delivery</h1>

      <section className="card-surface space-y-3 p-4">
        <h2 className="text-xl font-semibold">Zonas de entrega</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <input value={zoneName} onChange={(e) => setZoneName(e.target.value)} className="rounded-md border border-brand bg-brand-navy2 px-3 py-2" placeholder="Nome da zona" />
          <input value={zoneFee} onChange={(e) => setZoneFee(e.target.value)} className="rounded-md border border-brand bg-brand-navy2 px-3 py-2" placeholder="Taxa" />
          <input value={zoneMin} onChange={(e) => setZoneMin(e.target.value)} className="rounded-md border border-brand bg-brand-navy2 px-3 py-2" placeholder="Pedido minimo" />
          <button onClick={() => zoneMutation.mutate()} className="rounded-md bg-brand-red px-4 py-2 font-semibold">
            Criar zona
          </button>
        </div>
        <div className="space-y-1 text-sm text-brand-gray">
          {zones?.map((zone) => (
            <div key={zone.id}>
              {zone.name} - taxa {zone.fee} - minimo {zone.minOrderValue ?? 0}
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface space-y-3 p-4">
        <h2 className="text-xl font-semibold">Bairros</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <input value={neighborhoodName} onChange={(e) => setNeighborhoodName(e.target.value)} className="rounded-md border border-brand bg-brand-navy2 px-3 py-2" placeholder="Nome do bairro" />
          <select value={neighborhoodZoneId} onChange={(e) => setNeighborhoodZoneId(e.target.value)} className="rounded-md border border-brand bg-brand-navy2 px-3 py-2">
            <option value="">Selecione a zona</option>
            {zones?.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
          <button onClick={() => neighborhoodMutation.mutate()} className="rounded-md bg-brand-red px-4 py-2 font-semibold">
            Criar bairro
          </button>
        </div>
        <div className="space-y-1 text-sm text-brand-gray">
          {neighborhoods?.map((neighborhood) => (
            <div key={neighborhood.id}>
              {neighborhood.name} - zona {neighborhood.deliveryZoneId}
            </div>
          ))}
        </div>
      </section>

      <section className="card-surface space-y-3 p-4">
        <h2 className="text-xl font-semibold">Slots de agendamento</h2>
        <div className="grid gap-2 md:grid-cols-4">
          <input value={slotStartAt} onChange={(e) => setSlotStartAt(e.target.value)} className="rounded-md border border-brand bg-brand-navy2 px-3 py-2" placeholder="Inicio ISO" />
          <input value={slotEndAt} onChange={(e) => setSlotEndAt(e.target.value)} className="rounded-md border border-brand bg-brand-navy2 px-3 py-2" placeholder="Fim ISO" />
          <input value={slotCapacity} onChange={(e) => setSlotCapacity(e.target.value)} className="rounded-md border border-brand bg-brand-navy2 px-3 py-2" placeholder="Capacidade" />
          <button onClick={() => slotMutation.mutate()} className="rounded-md bg-brand-red px-4 py-2 font-semibold">
            Criar slot
          </button>
        </div>
        <div className="space-y-1 text-sm text-brand-gray">
          {slots?.map((slot) => (
            <div key={slot.id}>
              {new Date(slot.startAt).toLocaleString()} - {new Date(slot.endAt).toLocaleString()} - {slot.usedCapacity}/{slot.capacity}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

