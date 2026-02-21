'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { addressesApi, checkoutApi, deliveryApi, formatMoney } from '@pizza/shared';
import type { DeliveryAddress } from '@pizza/shared';
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper';
import { useServerCart } from '@/hooks/useServerCart';
import { useAuthGuard } from '@/lib/guards/auth.guard';
import { MapPin, Truck, Clock, Banknote, CreditCard, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { t } from '@/lib/i18n';

const inputClass =
  'flex h-10 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm placeholder:text-brand-gray/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow';

export default function CheckoutPage() {
  const { isReady } = useAuthGuard();
  const { cart, invalidate } = useServerCart();

  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card_on_delivery'>('cash_on_delivery');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.list,
    enabled: isReady,
  });

  const { data: zones } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: deliveryApi.listZones,
    enabled: isReady,
  });

  const { data: neighborhoods } = useQuery({
    queryKey: ['neighborhoods'],
    queryFn: deliveryApi.listNeighborhoods,
    enabled: isReady,
  });

  const { data: slots } = useQuery({
    queryKey: ['delivery-slots'],
    queryFn: () => deliveryApi.listSlots(),
    enabled: isReady && step >= 2,
  });

  const zoneMap = useMemo(() => new Map(zones?.map((z) => [z.id, z]) ?? []), [zones]);
  const neighborhoodMap = useMemo(() => new Map(neighborhoods?.map((n) => [n.id, n]) ?? []), [neighborhoods]);

  const resolveDeliveryFee = (address: DeliveryAddress) => {
    const neighborhood = neighborhoodMap.get(address.neighborhoodId);
    if (!neighborhood) return 0;
    const zone = zoneMap.get(neighborhood.deliveryZoneId);
    return zone?.fee ?? 0;
  };

  const handleSelectAddress = (addr: DeliveryAddress) => {
    setSelectedAddressId(addr.id);
    const fee = resolveDeliveryFee(addr);
    setDeliveryFee(fee);
  };

  const subtotal = cart?.subtotal ?? 0;
  const total = subtotal + deliveryFee;

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) return;
    setLoading(true);
    setError('');
    try {
      const idempotencyKey = crypto.randomUUID();
      const order = await checkoutApi.create(idempotencyKey, {
        addressId: selectedAddressId,
        paymentMethod,
        changeFor: paymentMethod === 'cash_on_delivery' && changeFor ? Number(changeFor) : undefined,
        notes: notes || undefined,
        slotId: selectedSlotId ?? undefined,
      });
      setOrderId(order.id);
      invalidate();
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error_generic);
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-brand-yellow" size={32} /></div>;
  }

  if ((!cart || cart.items.length === 0) && step < 4) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <p className="text-xl text-brand-gray">{t.checkout_empty_cart}</p>
        <Link href="/menu" className="rounded-md bg-brand-red px-6 py-3 font-semibold hover:bg-brand-red2 transition-colors">
          {t.cart_browse_menu}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{t.checkout_title}</h1>
      <CheckoutStepper step={step} />

      {/* Step 1 — Select Address */}
      {step === 1 && (
        <div className="card-surface space-y-5 p-6">
          <div className="flex items-center gap-2 text-brand-yellow">
            <MapPin size={20} />
            <h2 className="text-lg font-semibold">{t.checkout_address_title}</h2>
          </div>

          {addresses && addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const fee = resolveDeliveryFee(addr);
                return (
                  <button
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-yellow bg-brand-yellow/10'
                        : 'border-brand hover:border-brand-gray'
                    }`}
                  >
                    <MapPin size={18} className={selectedAddressId === addr.id ? 'text-brand-yellow' : 'text-brand-gray'} />
                    <div className="flex-1">
                      <p className="font-semibold">{addr.label}</p>
                      <p className="text-sm text-brand-gray">
                        {addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-brand-gray">{t.checkout_delivery_fee}</p>
                      <p className="text-sm font-bold text-brand-yellow">{formatMoney(fee)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-brand-gray">
              <p>{t.checkout_no_addresses}</p>
            </div>
          )}

          <Link
            href="/account/addresses"
            className="flex items-center gap-2 text-sm text-brand-yellow hover:underline"
          >
            <Plus size={14} />
            {t.checkout_new_address}
          </Link>

          <button
            onClick={() => setStep(2)}
            disabled={!selectedAddressId}
            className="w-full rounded-md bg-brand-red px-6 py-3 font-semibold hover:bg-brand-red2 disabled:opacity-50 transition-colors"
          >
            {t.checkout_continue}
          </button>
        </div>
      )}

      {/* Step 2 — Delivery Time */}
      {step === 2 && (
        <div className="card-surface space-y-5 p-6">
          <div className="flex items-center gap-2 text-brand-yellow">
            <Clock size={20} />
            <h2 className="text-lg font-semibold">{t.checkout_delivery_title}</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setSelectedSlotId(null)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                !selectedSlotId ? 'border-brand-yellow bg-brand-yellow/10' : 'border-brand hover:border-brand-gray'
              }`}
            >
              <Truck size={20} className={!selectedSlotId ? 'text-brand-yellow' : 'text-brand-gray'} />
              <div>
                <p className="font-semibold">{t.checkout_delivery_now}</p>
                <p className="text-sm text-brand-gray">{t.checkout_delivery_now_desc}</p>
              </div>
            </button>

            {slots?.filter((s) => s.isActive && s.usedCapacity < s.capacity).map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                  selectedSlotId === slot.id ? 'border-brand-yellow bg-brand-yellow/10' : 'border-brand hover:border-brand-gray'
                }`}
              >
                <Clock size={20} className={selectedSlotId === slot.id ? 'text-brand-yellow' : 'text-brand-gray'} />
                <div>
                  <p className="font-semibold">
                    {new Date(slot.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-brand-gray">
                    {slot.capacity - slot.usedCapacity} vagas restantes
                  </p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full rounded-md bg-brand-red px-6 py-3 font-semibold hover:bg-brand-red2 transition-colors"
          >
            {t.checkout_continue}
          </button>
        </div>
      )}

      {/* Step 3 — Payment + Notes + Confirm */}
      {step === 3 && (
        <div className="card-surface space-y-6 p-6">
          <div className="flex items-center gap-2 text-brand-yellow">
            <CreditCard size={20} />
            <h2 className="text-lg font-semibold">{t.checkout_payment_title}</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setPaymentMethod('cash_on_delivery')}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                paymentMethod === 'cash_on_delivery' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-brand hover:border-brand-gray'
              }`}
            >
              <Banknote size={20} className={paymentMethod === 'cash_on_delivery' ? 'text-brand-yellow' : 'text-brand-gray'} />
              <span className="font-semibold text-sm">{t.checkout_payment_cash}</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card_on_delivery')}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                paymentMethod === 'card_on_delivery' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-brand hover:border-brand-gray'
              }`}
            >
              <CreditCard size={20} className={paymentMethod === 'card_on_delivery' ? 'text-brand-yellow' : 'text-brand-gray'} />
              <span className="font-semibold text-sm">{t.checkout_payment_card}</span>
            </button>
          </div>

          {paymentMethod === 'cash_on_delivery' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-brand-gray">{t.checkout_change_for}</label>
              <input
                type="number"
                value={changeFor}
                onChange={(e) => setChangeFor(e.target.value)}
                className={inputClass}
                placeholder="Ex: 50"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-gray">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm placeholder:text-brand-gray/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow min-h-[80px]"
              placeholder={t.checkout_notes_placeholder}
            />
          </div>

          {/* Order summary */}
          <div className="rounded-lg border border-brand bg-brand-navy p-4 space-y-2 text-sm">
            <div className="flex justify-between text-brand-gray">
              <span>{t.cart_subtotal}</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-brand-gray">
                <span>{t.cart_delivery_fee}</span>
                <span>{formatMoney(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-brand pt-2 text-base font-bold text-brand-yellow">
              <span>{t.cart_total}</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-red px-6 py-3 font-semibold hover:bg-brand-red2 disabled:opacity-60 transition-colors shadow-glow"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? t.checkout_processing : t.checkout_confirm_order}
          </button>
        </div>
      )}

      {/* Step 4 — Confirmation */}
      {step === 4 && (
        <div className="card-surface flex flex-col items-center gap-6 p-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 size={48} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              {t.checkout_success_title}
            </h2>
            <p className="mt-2 text-brand-gray">{t.checkout_success_desc}</p>
            {orderId && (
              <p className="mt-3 text-sm text-brand-gray">
                {t.checkout_success_id}: <span className="font-mono text-brand-yellow">{orderId.slice(0, 8).toUpperCase()}</span>
              </p>
            )}
          </div>
          <Link
            href={orderId ? `/orders/${orderId}` : '/orders'}
            className="rounded-md bg-brand-red px-6 py-3 font-semibold hover:bg-brand-red2 transition-colors"
          >
            {t.checkout_track_order}
          </Link>
        </div>
      )}
    </div>
  );
}
