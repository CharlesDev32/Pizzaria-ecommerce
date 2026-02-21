'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { catalogApi, formatMoney } from '@pizza/shared';
import type { MenuOptionGroup } from '@pizza/shared';
import { QuantityStepper } from '@/components/product/QuantityStepper';
import { ProductCard } from '@/components/product/ProductCard';
import { useServerCart } from '@/hooks/useServerCart';
import { useAuthStore } from '@/store/auth.store';
import { t } from '@/lib/i18n';

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const { addItem } = useServerCart();
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const { data } = useQuery({
    queryKey: ['product-list'],
    queryFn: () => catalogApi.listProducts({ limit: 50 }),
  });

  const product = data?.data.find((p) => p.slug === params?.slug);
  const basePrice = product ? (product.promoPrice ?? product.price) : 0;
  const groups = product?.optionGroups ?? [];
  const imageScale = Math.max(0.5, Math.min(3, Number(product?.imageScale ?? 1)));
  const imagePositionX = Math.max(0, Math.min(100, Number(product?.imagePositionX ?? 50)));
  const imagePositionY = Math.max(0, Math.min(100, Number(product?.imagePositionY ?? 50)));

  const optionsDelta = useMemo(() => {
    let delta = 0;
    for (const group of groups) {
      const selected = selectedOptions[group.id] ?? [];
      for (const optId of selected) {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) delta += opt.priceDelta;
      }
    }
    return delta;
  }, [groups, selectedOptions]);

  const finalPrice = (basePrice + optionsDelta) * qty;

  const toggleOption = (group: MenuOptionGroup, optionId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[group.id] ?? [];
      if (group.maxSelect === 1) {
        return { ...prev, [group.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= group.maxSelect) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
  };

  const allRequiredSelected = groups
    .filter((g) => g.isRequired)
    .every((g) => (selectedOptions[g.id]?.length ?? 0) >= g.minSelect);

  const handleAddToCart = () => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    const opts: Array<{ groupId: string; optionId: string }> = [];
    for (const [groupId, optionIds] of Object.entries(selectedOptions)) {
      for (const optionId of optionIds) {
        opts.push({ groupId, optionId });
      }
    }
    addItem.mutate({ productId: product!.id, quantity: qty, selectedOptions: opts });
    router.push('/cart');
  };

  if (!product) {
    return <div className="text-brand-gray">{t.product_not_found}</div>;
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl">
          <img
            src={product.images?.[0]?.url || '/brand/product-placeholder.svg'}
            alt={product.title}
            className="h-80 w-full object-cover"
            style={{
              objectPosition: `${imagePositionX}% ${imagePositionY}%`,
              transform: `scale(${imageScale})`,
              transformOrigin: `${imagePositionX}% ${imagePositionY}%`,
            }}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = '/brand/product-placeholder.svg'; }
            }}
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{product.title}</h1>
          <p className="text-brand-gray">{product.description ?? t.product_default_description}</p>

          {/* Dynamic option groups */}
          {groups.map((group) => {
            const selected = selectedOptions[group.id] ?? [];
            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{group.name}</h3>
                  {group.isRequired && (
                    <span className="rounded bg-brand-red/20 px-2 py-0.5 text-xs font-medium text-brand-red">
                      {t.product_select_required}
                    </span>
                  )}
                  {group.maxSelect > 1 && (
                    <span className="text-xs text-brand-gray">
                      {t.product_select_up_to.replace('{max}', String(group.maxSelect))}
                    </span>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.options.filter((o) => o.isActive).map((option) => {
                    const isSelected = selected.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleOption(group, option.id)}
                        className={`flex items-center justify-between rounded-md border-2 p-3 text-left text-sm transition-all ${
                          isSelected
                            ? 'border-brand-yellow bg-brand-yellow/10'
                            : 'border-brand hover:border-brand-gray'
                        }`}
                      >
                        <span>{option.name}</span>
                        {option.priceDelta > 0 && (
                          <span className="text-xs text-brand-yellow">+ {formatMoney(option.priceDelta)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <QuantityStepper value={qty} onChange={setQty} />
          <div className="text-2xl font-bold text-brand-yellow">{formatMoney(finalPrice)}</div>
          <button
            className="w-full rounded-md bg-brand-red px-6 py-3 font-semibold hover:bg-brand-red2 transition-colors disabled:opacity-50"
            onClick={handleAddToCart}
            disabled={!allRequiredSelected || addItem.isPending}
          >
            {addItem.isPending ? t.loading : t.product_add_to_cart}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>{t.product_related}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data?.data.filter((p) => p.id !== product.id).slice(0, 4).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
