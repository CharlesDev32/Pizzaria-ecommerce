'use client';

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, Product, settingsApi } from '@pizza/shared';
import { ImageIcon, Pencil, Plus, Save, Upload, X } from 'lucide-react';
import { useAdminAuthStore } from '@/store/admin-auth.store';

type ProductFormState = {
  title: string;
  description: string;
  sku: string;
  slug: string;
  price: string;
  promoPrice: string;
  status: 'draft' | 'active';
  categoryId: string;
  tags: string;
  imageUrl: string;
  imageScale: string;
  imagePositionX: string;
  imagePositionY: string;
};

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function toForm(product: Product): ProductFormState {
  return {
    title: product.title ?? '',
    description: product.description ?? '',
    sku: product.sku ?? '',
    slug: product.slug ?? '',
    price: String(product.price ?? ''),
    promoPrice: product.promoPrice != null ? String(product.promoPrice) : '',
    status: product.status ?? 'draft',
    categoryId: product.categoryId ?? '',
    tags: (product.tags ?? []).join(', '),
    imageUrl: product.images?.[0]?.url ?? '',
    imageScale: String(product.imageScale ?? 1),
    imagePositionX: String(product.imagePositionX ?? 50),
    imagePositionY: String(product.imagePositionY ?? 50),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const token = useAdminAuthStore((s) => s.accessToken);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [createStatus, setCreateStatus] = useState<'draft' | 'active'>('active');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminApi.products.list,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.categories.list,
  });

  async function create() {
    if (!title || !price) return;
    setError(null);

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Informe um preco valido para criar o produto.');
      return;
    }

    await adminApi.products.create({
      sku: `SKU-${Date.now()}`,
      slug: toSlug(title),
      title: title.trim(),
      price: numericPrice,
      status: createStatus,
    });

    setTitle('');
    setPrice('');
    setCreateStatus('active');
    await qc.invalidateQueries({ queryKey: ['admin-products'] });
  }

  function startEdit(product: Product) {
    setError(null);
    setEditingId(product.id);
    setEditingProduct(product);
    setForm(toForm(product));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingProduct(null);
    setForm(null);
    setError(null);
  }

  async function handleEditImageUpload(file?: File) {
    if (!file) return;
    if (!token) {
      setError('Faca login novamente para enviar imagem.');
      return;
    }
    setError(null);
    setIsUploadingImage(true);
    try {
      const result = await settingsApi.uploadImage(file, token);
      setForm((prev) => (prev ? { ...prev, imageUrl: result.url } : prev));
    } catch (err) {
      setError((err as Error).message || 'Nao foi possivel enviar a imagem.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function saveEdit() {
    if (!editingId || !form) return;
    setError(null);

    const numericPrice = Number(form.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Informe um preco valido para salvar.');
      return;
    }

    const promoPrice = form.promoPrice.trim().length > 0 ? Number(form.promoPrice) : undefined;
    if (promoPrice !== undefined && (!Number.isFinite(promoPrice) || promoPrice < 0)) {
      setError('Informe um preco promocional valido.');
      return;
    }

    const imageScale = clamp(Number(form.imageScale), 0.5, 3);
    const imagePositionX = clamp(Number(form.imagePositionX), 0, 100);
    const imagePositionY = clamp(Number(form.imagePositionY), 0, 100);

    setIsSaving(true);
    try {
      await adminApi.products.update(editingId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        sku: form.sku.trim(),
        slug: toSlug(form.slug || form.title),
        price: numericPrice,
        promoPrice,
        status: form.status,
        categoryId: form.categoryId || undefined,
        tags: form.tags
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        imageScale,
        imagePositionX,
        imagePositionY,
        images: form.imageUrl.trim().length > 0
          ? [{
              id: editingProduct?.images?.[0]?.id ?? `img-${Date.now()}`,
              url: form.imageUrl.trim(),
              objectKey: editingProduct?.images?.[0]?.objectKey ?? '',
              mimeType: editingProduct?.images?.[0]?.mimeType ?? 'image/jpeg',
              sizeBytes: editingProduct?.images?.[0]?.sizeBytes ?? 0,
            }]
          : [],
      });
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      cancelEdit();
    } catch (err) {
      setError((err as Error).message || 'Nao foi possivel salvar as alteracoes.');
    } finally {
      setIsSaving(false);
    }
  }

  const categoryMap = new Map((categories ?? []).map((cat) => [cat.id, cat.name]));
  const previewScale = form ? clamp(Number(form.imageScale), 0.5, 3) : 1;
  const previewPosX = form ? clamp(Number(form.imagePositionX), 0, 100) : 50;
  const previewPosY = form ? clamp(Number(form.imagePositionY), 0, 100) : 50;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Produtos</h1>

      {error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="card-surface grid gap-2 p-4 md:grid-cols-4">
        <input
          className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
          placeholder="Nome do produto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
          placeholder="Preco (ex: 29.90)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <select
          value={createStatus}
          onChange={(e) => setCreateStatus(e.target.value as 'draft' | 'active')}
          className="rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
        >
          <option value="active">Ativo</option>
          <option value="draft">Rascunho</option>
        </select>
        <button
          className="flex items-center justify-center gap-2 rounded-md bg-brand-red px-4 py-2 font-semibold hover:bg-brand-red2 transition-colors"
          onClick={create}
        >
          <Plus size={16} /> Criar produto
        </button>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-brand-navy2" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-navy2">
              <tr>
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Preco</th>
                <th className="px-3 py-2">Promocao</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((product) => (
                <tr key={product.id} className="border-t border-brand">
                  <td className="px-3 py-2">
                    <div className="font-medium">{product.title}</div>
                    <div className="text-xs text-brand-gray">{product.slug}</div>
                  </td>
                  <td className="px-3 py-2">R$ {Number(product.price).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    {product.promoPrice != null ? `R$ ${Number(product.promoPrice).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs ${product.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                      {product.status === 'active' ? 'Ativo' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {product.categoryId ? categoryMap.get(product.categoryId) ?? product.categoryId : 'Sem categoria'}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="inline-flex items-center gap-1 rounded-md border border-brand px-2 py-1 text-xs hover:bg-brand-navy2 transition-colors"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingId && form ? (
        <div className="card-surface space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Editar produto</h2>
            <span className="text-xs text-brand-gray">ID: {editingId}</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-xl border border-brand bg-brand-navy2">
              {form.imageUrl.trim() ? (
                <img
                  src={form.imageUrl}
                  alt={form.title || 'Produto'}
                  className="h-40 w-full object-cover"
                  style={{
                    objectPosition: `${previewPosX}% ${previewPosY}%`,
                    transform: `scale(${previewScale})`,
                    transformOrigin: `${previewPosX}% ${previewPosY}%`,
                  }}
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center text-brand-gray">
                  <ImageIcon size={22} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-brand-gray">Foto do produto</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="inline-flex items-center gap-2 rounded-md border border-brand px-3 py-2 text-xs hover:bg-brand-navy2 disabled:opacity-60 transition-colors"
                >
                  <Upload size={14} />
                  {isUploadingImage ? 'Enviando...' : 'Enviar foto'}
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => (prev ? { ...prev, imageUrl: '' } : prev))}
                  className="inline-flex items-center gap-2 rounded-md border border-brand px-3 py-2 text-xs hover:bg-brand-navy2 transition-colors"
                >
                  <X size={14} />
                  Remover foto
                </button>
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  void handleEditImageUpload(file);
                  e.target.value = '';
                }}
              />
              <input
                className="w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                placeholder="Ou cole a URL da imagem"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, imageUrl: e.target.value } : prev))}
              />
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <label className="text-xs text-brand-gray">Zoom (%)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={50}
                      max={300}
                      step={1}
                      value={Math.round(previewScale * 100)}
                      onChange={(e) => setForm((prev) => (prev ? { ...prev, imageScale: String(Number(e.target.value) / 100) } : prev))}
                      className="flex-1 accent-brand-yellow"
                    />
                    <input
                      type="number"
                      min={50}
                      max={300}
                      value={Math.round(previewScale * 100)}
                      onChange={(e) => setForm((prev) => (prev ? { ...prev, imageScale: String(clamp(Number(e.target.value), 50, 300) / 100) } : prev))}
                      className="w-16 rounded-md border border-brand bg-brand-navy px-2 py-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-brand-gray">Posicao X (%)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(previewPosX)}
                      onChange={(e) => setForm((prev) => (prev ? { ...prev, imagePositionX: String(Number(e.target.value)) } : prev))}
                      className="flex-1 accent-brand-yellow"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(previewPosX)}
                      onChange={(e) => setForm((prev) => (prev ? { ...prev, imagePositionX: String(clamp(Number(e.target.value), 0, 100)) } : prev))}
                      className="w-16 rounded-md border border-brand bg-brand-navy px-2 py-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-brand-gray">Posicao Y (%)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(previewPosY)}
                      onChange={(e) => setForm((prev) => (prev ? { ...prev, imagePositionY: String(Number(e.target.value)) } : prev))}
                      className="flex-1 accent-brand-yellow"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round(previewPosY)}
                      onChange={(e) => setForm((prev) => (prev ? { ...prev, imagePositionY: String(clamp(Number(e.target.value), 0, 100)) } : prev))}
                      className="w-16 rounded-md border border-brand bg-brand-navy px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs text-brand-gray">Nome</label>
              <input
                className="mt-1 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                value={form.title}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
              />
            </div>
            <div>
              <label className="text-xs text-brand-gray">SKU</label>
              <input
                className="mt-1 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                value={form.sku}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, sku: e.target.value } : prev))}
              />
            </div>
            <div>
              <label className="text-xs text-brand-gray">Slug</label>
              <input
                className="mt-1 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                value={form.slug}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, slug: e.target.value } : prev))}
              />
            </div>
            <div>
              <label className="text-xs text-brand-gray">Categoria</label>
              <select
                className="mt-1 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                value={form.categoryId}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, categoryId: e.target.value } : prev))}
              >
                <option value="">Sem categoria</option>
                {(categories ?? []).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-brand-gray">Preco</label>
              <input
                className="mt-1 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                value={form.price}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, price: e.target.value } : prev))}
              />
            </div>
            <div>
              <label className="text-xs text-brand-gray">Preco promocional (opcional)</label>
              <input
                className="mt-1 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                value={form.promoPrice}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, promoPrice: e.target.value } : prev))}
              />
            </div>
            <div>
              <label className="text-xs text-brand-gray">Status</label>
              <select
                className="mt-1 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, status: e.target.value as 'draft' | 'active' } : prev))}
              >
                <option value="active">Ativo</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-brand-gray">Tags (separadas por virgula)</label>
              <input
                className="mt-1 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
                value={form.tags}
                onChange={(e) => setForm((prev) => (prev ? { ...prev, tags: e.target.value } : prev))}
                placeholder="destaque, vegano, promocao"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-brand-gray">Descricao</label>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-brand bg-brand-navy px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => setForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={saveEdit}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-brand-red px-4 py-2 text-sm font-semibold hover:bg-brand-red2 disabled:opacity-60 transition-colors"
            >
              <Save size={14} />
              {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
            </button>
            <button
              onClick={cancelEdit}
              className="inline-flex items-center gap-2 rounded-md border border-brand px-4 py-2 text-sm hover:bg-brand-navy2 transition-colors"
            >
              <X size={14} />
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
