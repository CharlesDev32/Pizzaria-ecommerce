'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, formatMoney } from '@pizza/shared';
import { ShoppingCart } from 'lucide-react';
import { useServerCart } from '@/hooks/useServerCart';
import { useAuthStore } from '@/store/auth.store';
import { t } from '@/lib/i18n';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useServerCart();
  const token = useAuthStore((s) => s.accessToken);
  const currentPrice = product.promoPrice ?? product.price;
  const hasOptions = product.optionGroups && product.optionGroups.length > 0;
  const imageScale = Math.max(0.5, Math.min(3, Number(product.imageScale ?? 1)));
  const imagePositionX = Math.max(0, Math.min(100, Number(product.imagePositionX ?? 50)));
  const imagePositionY = Math.max(0, Math.min(100, Number(product.imagePositionY ?? 50)));

  const handleAdd = () => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (hasOptions) {
      router.push(`/product/${product.slug}`);
      return;
    }
    addItem.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <article className="card-surface group overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-glow">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <img
          src={product.images?.[0]?.url || '/brand/product-placeholder.svg'}
          alt={product.title}
          className="h-48 w-full object-cover transition-transform duration-300"
          style={{
            objectPosition: `${imagePositionX}% ${imagePositionY}%`,
            transform: `scale(${imageScale})`,
            transformOrigin: `${imagePositionX}% ${imagePositionY}%`,
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1';
              img.src = '/brand/product-placeholder.svg';
            }
          }}
        />
      </Link>
      <div className="space-y-3 p-4">
        <h3 className="font-heading text-base uppercase tracking-[0.12em] leading-snug">{product.title}</h3>
        <p className="line-clamp-2 text-sm text-brand-gray">
          {product.description ?? t.product_default_description}
        </p>
        <div className="flex items-center justify-between gap-3">
          <div>
            {product.promoPrice && (
              <span className="mr-2 text-sm text-brand-gray line-through">{formatMoney(product.price)}</span>
            )}
            <span className="text-xl font-bold text-brand-yellow">{formatMoney(currentPrice)}</span>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-full bg-brand-red px-4 py-2 text-[11px] font-heading uppercase tracking-[0.12em] text-brand-white transition-colors hover:bg-brand-red2"
            onClick={handleAdd}
          >
            <ShoppingCart size={14} />
            {hasOptions ? t.product_choose_options : t.product_add_to_cart}
          </button>
        </div>
      </div>
    </article>
  );
}
