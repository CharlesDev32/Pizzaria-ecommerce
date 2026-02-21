'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@pizza/shared';
import { Flame, Clock, Star } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { PromoBanner } from '@/components/layout/PromoBanner';
import { useTheme } from '@/components/providers/ThemeProvider';
import { t } from '@/lib/i18n';

const HOW_IT_WORKS = [
  { icon: Star, title: t.how_step_1_title, desc: t.how_step_1_desc },
  { icon: Clock, title: t.how_step_2_title, desc: t.how_step_2_desc },
  { icon: Flame, title: t.how_step_3_title, desc: t.how_step_3_desc },
];

export default function HomePage() {
  const theme = useTheme();
  const brandName = theme.brandName || t.brand_name;

  const { data: productsData } = useQuery({
    queryKey: ['home-products'],
    queryFn: () => catalogApi.listProducts({ page: 1, limit: 8 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.listCategories,
  });

  return (
    <div className="space-y-16">
      <PromoBanner />

      <section className="relative overflow-hidden rounded-[28px] border border-brand bg-brand-navy2/85 p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-red/40 blur-3xl" />
        <div className="space-y-5">
          <div className="space-y-3">
            <h1 className="font-brand text-5xl leading-none text-brand-white sm:text-6xl">{brandName}</h1>
            <p className="max-w-xl text-sm text-brand-gray sm:text-base">{t.hero_subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="rounded-full bg-brand-red px-6 py-3 text-xs font-heading uppercase tracking-[0.18em] text-brand-white transition-colors hover:bg-brand-red2"
            >
              {t.hero_cta_primary}
            </Link>
            <Link
              href="/orders"
              className="rounded-full border border-brand px-6 py-3 text-xs font-heading uppercase tracking-[0.18em] text-brand-yellow transition-colors hover:bg-brand-navy"
            >
              {t.nav_orders}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-3xl uppercase tracking-[0.1em]">{t.categories_title}</h2>
          <Link href="/menu" className="text-sm text-brand-yellow hover:underline">
            {t.categories_view_all}
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {categoriesData && categoriesData.length > 0
            ? categoriesData.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/menu?category=${cat.slug}`}
                  className="card-surface flex items-center justify-center rounded-full p-5 text-center font-heading text-sm uppercase tracking-[0.14em] transition-colors hover:bg-brand-red/15 hover:text-brand-yellow"
                >
                  {cat.name}
                </Link>
              ))
            : (t.categories_fallback as readonly string[]).map((item) => (
                <Link
                  key={item}
                  href="/menu"
                  className="card-surface flex items-center justify-center rounded-full p-5 text-center font-heading text-sm uppercase tracking-[0.14em] transition-colors hover:bg-brand-red/15 hover:text-brand-yellow"
                >
                  {item}
                </Link>
              ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-3xl uppercase tracking-[0.1em]">{t.best_sellers_title}</h2>
          <Link href="/menu" className="text-sm text-brand-yellow hover:underline">
            {t.best_sellers_view_all}
          </Link>
        </div>
        {productsData?.data?.length === 0 ? (
          <div className="card-surface p-8 text-center text-brand-gray">
            {t.best_sellers_empty}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productsData?.data?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-center font-heading text-3xl uppercase tracking-[0.1em]">
          {t.how_section_title}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="card-surface flex flex-col items-center gap-3 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/15 text-brand-yellow">
                <Icon size={24} />
              </div>
              <div>
                <p className="font-heading text-sm uppercase tracking-[0.14em]">{i + 1}. {title}</p>
                <p className="mt-1 text-sm text-brand-gray">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand bg-brand-navy2/65 p-6 text-center text-sm text-brand-gray">
        {t.delivery_info}
      </section>
    </div>
  );
}
