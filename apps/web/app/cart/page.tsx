'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatMoney } from '@pizza/shared';
import { Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { QuantityStepper } from '@/components/product/QuantityStepper';
import { useServerCart } from '@/hooks/useServerCart';
import { useAuthStore } from '@/store/auth.store';
import { Badge } from '@/components/ui/badge';
import { t } from '@/lib/i18n';

export default function CartPage() {
  const token = useAuthStore((s) => s.accessToken);
  const { cart, isLoading, updateItem, removeItem, applyCoupon } = useServerCart();
  const [couponInput, setCouponInput] = useState('');

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <ShoppingBag size={64} className="text-brand-gray/40" />
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{t.cart_title}</h1>
          <p className="mt-2 text-brand-gray">{t.cart_login_required}</p>
        </div>
        <Link href="/auth/login" className="rounded-md bg-brand-red px-6 py-3 font-semibold hover:bg-brand-red2 transition-colors">
          {t.auth_login_button}
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-brand-yellow" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <ShoppingBag size={64} className="text-brand-gray/40" />
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{t.cart_empty_title}</h1>
          <p className="mt-2 text-brand-gray">{t.cart_empty_desc}</p>
        </div>
        <Link href="/menu" className="rounded-md bg-brand-red px-6 py-3 font-semibold hover:bg-brand-red2 transition-colors">
          {t.cart_browse_menu}
        </Link>
      </div>
    );
  }

  const subtotal = cart?.subtotal ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{t.cart_title}</h1>
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className="card-surface flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">
                  Produto #{item.productId.slice(0, 6)}
                </p>
                <p className="text-sm text-brand-yellow font-medium">{formatMoney(item.unitPriceSnapshot)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <QuantityStepper
                  value={item.quantity}
                  onChange={(qty) => updateItem.mutate({ itemId: item.id, quantity: qty })}
                />
                <button
                  className="rounded-md p-2 text-brand-gray hover:bg-brand-red/20 hover:text-brand-red transition-colors"
                  onClick={() => removeItem.mutate(item.id)}
                  aria-label={t.cart_remove_item}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="card-surface space-y-4 p-5 h-fit">
          <h2 className="text-xl font-semibold">{t.cart_summary}</h2>

          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm placeholder:text-brand-gray/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
              placeholder={t.cart_coupon_placeholder}
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <button
              className="rounded-md border border-brand px-3 py-2 text-sm hover:bg-brand-navy2 transition-colors"
              onClick={() => applyCoupon.mutate(couponInput)}
            >
              {t.cart_coupon_apply}
            </button>
          </div>

          {cart?.couponCode && (
            <div className="flex items-center gap-2">
              <Badge variant="yellow">{t.cart_coupon_applied}</Badge>
              <span className="text-sm text-brand-gray">{cart.couponCode}</span>
            </div>
          )}

          <div className="space-y-2 border-t border-brand pt-3">
            <div className="flex justify-between text-sm text-brand-gray">
              <span>{t.cart_subtotal}</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-brand-yellow pt-1 border-t border-brand">
              <span>{t.cart_total}</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block rounded-md bg-brand-red px-4 py-3 text-center font-semibold hover:bg-brand-red2 transition-colors shadow-glow"
          >
            {t.cart_proceed_checkout}
          </Link>
        </aside>
      </div>
    </div>
  );
}
