'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@pizza/shared';
import { Search } from 'lucide-react';
import { PromoBanner } from '@/components/layout/PromoBanner';
import { ProductCard } from '@/components/product/ProductCard';
import { t } from '@/lib/i18n';

export default function MenuPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sort, setSort] = useState('popular');
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.listCategories,
  });

  const params = useMemo(
    () => ({ search, sort, page, limit: 12, ...(categoryId ? { categoryId } : {}) }),
    [search, sort, page, categoryId],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['menu-products', params],
    queryFn: () => catalogApi.listProducts(params),
  });

  const totalPages = data ? Math.ceil(data.total / 12) : 1;

  const selectClass =
    'rounded-md border border-brand bg-brand-navy2 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow';

  return (
    <div className="space-y-6">
      <PromoBanner />

      <div>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          {t.menu_title}
        </h1>
        <p className="mt-1 text-brand-gray">{t.menu_subtitle}</p>
      </div>

      {/* Category tabs */}
      {categoriesData && categoriesData.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => { setCategoryId(''); setPage(1); }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !categoryId ? 'bg-brand-yellow text-brand-navy' : 'border border-brand hover:bg-brand-navy2'
            }`}
          >
            {t.menu_all_categories}
          </button>
          {categoriesData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategoryId(cat.id); setPage(1); }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                categoryId === cat.id ? 'bg-brand-yellow text-brand-navy' : 'border border-brand hover:bg-brand-navy2'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray/50" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t.menu_search_placeholder}
            className="w-full rounded-md border border-brand bg-brand-navy2 py-2 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
          />
        </div>

        <select className={selectClass}>
          <option value="">{t.menu_any_price}</option>
          <option value="under20">{t.menu_price_under_20}</option>
          <option value="20to40">{t.menu_price_20_40}</option>
          <option value="over40">{t.menu_price_over_40}</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
          <option value="popular">{t.menu_sort_popular}</option>
          <option value="price_asc">{t.menu_sort_price_asc}</option>
          <option value="price_desc">{t.menu_sort_price_desc}</option>
          <option value="newest">{t.menu_sort_newest}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-brand-navy2" />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="card-surface p-12 text-center text-brand-gray">
          <p className="text-lg">{t.menu_no_results}</p>
          <button
            onClick={() => { setSearch(''); setCategoryId(''); }}
            className="mt-3 text-sm text-brand-yellow hover:underline"
          >
            {t.menu_clear_filters}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data?.data?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            className="rounded-md border border-brand px-4 py-2 text-sm hover:bg-brand-navy2 disabled:opacity-40 transition-colors"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t.menu_previous}
          </button>
          <span className="text-sm text-brand-gray">
            {t.page_of.replace('{page}', String(page)).replace('{total}', String(totalPages))}
          </span>
          <button
            className="rounded-md border border-brand px-4 py-2 text-sm hover:bg-brand-navy2 disabled:opacity-40 transition-colors"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            {t.menu_next}
          </button>
        </div>
      )}
    </div>
  );
}
