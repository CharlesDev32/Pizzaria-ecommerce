'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  settingsApi,
  StoreSettings,
  DEFAULT_SETTINGS,
  FONT_BODY_OPTIONS,
  FONT_HEADING_OPTIONS,
  BANNER_FONT_OPTIONS,
  resolveFontFamily,
  resolveHeadingFontWeight,
} from '@pizza/shared';
import { Palette, Type, Image, Save, RotateCcw, Check, Upload, X, ImageIcon, Maximize2 } from 'lucide-react';
import { useAdminAuthStore } from '@/store/admin-auth.store';

/* ── Preload all Google Fonts used in selectors so previews work ── */
const ALL_FONTS = [...new Set([...FONT_BODY_OPTIONS, ...FONT_HEADING_OPTIONS, ...BANNER_FONT_OPTIONS].map(resolveFontFamily))];
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?' +
  ALL_FONTS.map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800`).join('&') +
  '&display=swap';

type FormData = StoreSettings;

const BG_OPACITY_MIN = 0;
const BG_OPACITY_MAX = 100;
const BANNER_HEIGHT_MIN = 120;
const BANNER_HEIGHT_MAX = 520;
const BANNER_FONT_MIN = 20;
const BANNER_FONT_MAX = 96;
const BANNER_WORD_COLOR_SLOTS = 8;

function clampBackgroundOpacity(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.backgroundImageOpacity;
  return Math.max(BG_OPACITY_MIN, Math.min(BG_OPACITY_MAX, Math.round(value)));
}

function clampPercent(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampBannerHeight(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.banner.height;
  return Math.max(BANNER_HEIGHT_MIN, Math.min(BANNER_HEIGHT_MAX, Math.round(value)));
}

function clampBannerFontSize(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.banner.fontSize;
  return Math.max(BANNER_FONT_MIN, Math.min(BANNER_FONT_MAX, Math.round(value)));
}

function ensureWordColors(colors: string[] | undefined): string[] {
  const seed = Array.isArray(colors) ? colors.filter((c) => typeof c === 'string' && c.trim().length > 0) : [];
  const fallback = DEFAULT_SETTINGS.banner.wordColors;
  const base = seed.length > 0 ? seed : fallback;
  const next = [...base];
  while (next.length < BANNER_WORD_COLOR_SLOTS) {
    next.push(fallback[next.length % fallback.length]);
  }
  return next.slice(0, BANNER_WORD_COLOR_SLOTS);
}

function fontFamilyStyle(font: string) {
  return `'${resolveFontFamily(font)}', sans-serif`;
}

function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function colorizeWords(text: string, colors: string[], startIndex = 0) {
  const words = splitWords(text);
  if (words.length === 0) return null;
  const palette = colors.length > 0 ? colors : ensureWordColors(undefined);
  return words.map((word, idx) => (
    <span key={`${word}-${idx}`} style={{ color: palette[(startIndex + idx) % palette.length] }}>
      {word}
      {idx < words.length - 1 ? ' ' : ''}
    </span>
  ));
}

function hexToRgba(hex: string, opacityPercent: number): string {
  const clean = (hex || '').replace('#', '').trim();
  const alpha = clampPercent(opacityPercent, 60) / 100;
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) return `rgba(9, 8, 7, ${alpha})`;
  const expanded = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.slice(0, 6);
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 w-28 rounded border border-white/10 bg-brand-navy px-2 py-1 text-xs font-mono"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function ImageUploader({
  label,
  value,
  onChange,
  onUpload,
  previewClass,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<void>;
  previewClass?: string;
  hint?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-brand-gray">{label}</label>

      {/* Drop zone */}
      <div
        className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
          dragOver ? 'border-brand-yellow bg-brand-yellow/5' : 'border-white/10 hover:border-white/20'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !value && fileInputRef.current?.click()}
      >
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className={`w-full rounded-lg object-cover ${previewClass || 'h-24'}`}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <ImageIcon size={24} className="text-brand-gray" />
            <p className="text-xs text-brand-gray">
              {uploading ? 'Enviando...' : 'Arraste uma imagem ou clique para enviar'}
            </p>
            <p className="text-xs text-brand-gray/60">JPEG, PNG, WebP, SVG ou GIF (máx. 5MB)</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs hover:bg-brand-navy2 transition-colors disabled:opacity-50"
        >
          <Upload size={12} />
          {uploading ? 'Enviando...' : 'Enviar arquivo'}
        </button>
        <span className="text-xs text-brand-gray">ou</span>
        <input
          type="text"
          value={value.startsWith('data:') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-white/10 bg-brand-navy px-2 py-1.5 text-xs"
          placeholder="Cole a URL da imagem"
        />
      </div>

      {hint && <p className="text-xs text-brand-gray/60">{hint}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const token = useAdminAuthStore((s) => s.accessToken);
  const [saved, setSaved] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: settingsApi.get,
  });

  const [form, setForm] = useState<FormData>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (settings) {
      setForm({
        ...DEFAULT_SETTINGS,
        ...settings,
        colors: { ...DEFAULT_SETTINGS.colors, ...settings.colors },
        backgroundImageOpacity: clampBackgroundOpacity(
          settings.backgroundImageOpacity ?? DEFAULT_SETTINGS.backgroundImageOpacity,
        ),
        banner: {
          ...DEFAULT_SETTINGS.banner,
          ...(settings.banner ?? {}),
          imageOpacity: clampPercent(
            settings.banner?.imageOpacity ?? DEFAULT_SETTINGS.banner.imageOpacity,
            DEFAULT_SETTINGS.banner.imageOpacity,
          ),
          overlayOpacity: clampPercent(
            settings.banner?.overlayOpacity ?? DEFAULT_SETTINGS.banner.overlayOpacity,
            DEFAULT_SETTINGS.banner.overlayOpacity,
          ),
          height: clampBannerHeight(settings.banner?.height ?? DEFAULT_SETTINGS.banner.height),
          fontSize: clampBannerFontSize(settings.banner?.fontSize ?? DEFAULT_SETTINGS.banner.fontSize),
          wordColors: ensureWordColors(settings.banner?.wordColors),
        },
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: Partial<StoreSettings>) => settingsApi.update(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    mutation.mutate(form);
  };

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    mutation.mutate(DEFAULT_SETTINGS);
  };

  const updateColor = (key: keyof StoreSettings['colors'], value: string) => {
    setForm((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  };

  const updateBanner = (patch: Partial<StoreSettings['banner']>) => {
    setForm((prev) => ({ ...prev, banner: { ...prev.banner, ...patch } }));
  };

  const updateBannerWordColor = (index: number, value: string) => {
    setForm((prev) => {
      const wordColors = ensureWordColors(prev.banner.wordColors);
      wordColors[index] = value;
      return { ...prev, banner: { ...prev.banner, wordColors } };
    });
  };

  const handleImageUpload = async (
    field: 'logoUrl' | 'heroImageUrl' | 'backgroundImageUrl' | 'bannerImageUrl' | 'bannerSideImageUrl',
    file: File,
  ) => {
    if (!token) return;
    const result = await settingsApi.uploadImage(file, token);
    if (field === 'bannerImageUrl') {
      updateBanner({ imageUrl: result.url });
      return;
    }
    if (field === 'bannerSideImageUrl') {
      updateBanner({ sideImageUrl: result.url });
      return;
    }
    setForm((prev) => ({ ...prev, [field]: result.url }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Design da Loja</h1>
        <div className="card-surface p-8 text-center text-brand-gray">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preload all Google Fonts for preview */}
      <link rel="stylesheet" href={GOOGLE_FONTS_URL} />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Design da Loja</h1>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <Check size={16} /> Salvo!
            </span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm hover:bg-brand-navy2 transition-colors"
          >
            <RotateCcw size={14} />
            Restaurar padrão
          </button>
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-md bg-brand-red px-4 py-2 text-sm font-semibold hover:bg-brand-red2 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {mutation.isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {mutation.isError && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Erro ao salvar: {(mutation.error as Error).message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identity Section */}
        <section className="card-surface space-y-5 p-6">
          <div className="flex items-center gap-2 text-brand-yellow">
            <Image size={20} />
            <h2 className="text-lg font-semibold">Identidade da Marca</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-brand-gray">Nome do restaurante</label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm((prev) => ({ ...prev, brandName: e.target.value }))}
                className="mt-1 w-full rounded-md border border-white/10 bg-brand-navy px-3 py-2 text-sm"
                placeholder="Sabor Express"
              />
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-brand-gray">Exibir nome do restaurante</p>
                  <p className="text-xs text-brand-gray/70">Mostra o nome ao lado do logo no site.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.showBrandName}
                  onChange={(e) => setForm((prev) => ({ ...prev, showBrandName: e.target.checked }))}
                  className="h-4 w-4 accent-brand-yellow"
                />
              </label>
            </div>

            <ImageUploader
              label="Logotipo"
              value={form.logoUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
              onUpload={(file) => handleImageUpload('logoUrl', file)}
              previewClass="h-20 !object-contain bg-white/5 p-2"
              hint="Recomendado: imagem quadrada, 200x200px ou maior"
            />

            {/* Logo Size Control — visible when a logo is set */}
            {form.logoUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Maximize2 size={14} className="text-brand-gray" />
                  <label className="text-sm font-medium text-brand-gray">Tamanho do logotipo</label>
                  <span className="ml-auto text-xs font-mono text-brand-yellow">{form.logoSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={20}
                    max={120}
                    step={2}
                    value={form.logoSize}
                    onChange={(e) => setForm((prev) => ({ ...prev, logoSize: Number(e.target.value) }))}
                    className="flex-1 accent-brand-yellow"
                  />
                  <input
                    type="number"
                    min={20}
                    max={120}
                    value={form.logoSize}
                    onChange={(e) => {
                      const v = Math.min(120, Math.max(20, Number(e.target.value) || 20));
                      setForm((prev) => ({ ...prev, logoSize: v }));
                    }}
                    className="w-16 rounded border border-white/10 bg-brand-navy px-2 py-1 text-center text-xs font-mono"
                  />
                </div>
                {/* Live size preview */}
                <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
                  <img
                    src={form.logoUrl}
                    alt="Preview tamanho"
                    style={{ height: form.logoSize, width: Math.round(form.logoSize * 2.2) }}
                    className="rounded object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {form.showBrandName && (
                    <span className="text-sm uppercase tracking-wide" style={{ fontFamily: fontFamilyStyle(form.fontHeading), fontWeight: resolveHeadingFontWeight(form.fontHeading) }}>
                      {form.brandName}
                    </span>
                  )}
                </div>
              </div>
            )}

            <ImageUploader
              label="Imagem do banner principal (Hero)"
              value={form.heroImageUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, heroImageUrl: url }))}
              onUpload={(file) => handleImageUpload('heroImageUrl', file)}
              previewClass="h-32"
              hint="Recomendado: 1200x400px, formato paisagem"
            />
          </div>
        </section>

        {/* Promo Banner Section */}
        <section className="card-surface space-y-5 p-6">
          <div className="flex items-center gap-2 text-brand-yellow">
            <Image size={20} />
            <h2 className="text-lg font-semibold">Banner Promocional</h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-brand-gray">Exibir banner promocional</p>
                  <p className="text-xs text-brand-gray/70">Mostra o banner no inicio da Home e no topo do Cardapio.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.banner.enabled}
                  onChange={(e) => updateBanner({ enabled: e.target.checked })}
                  className="h-4 w-4 accent-brand-yellow"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-brand-gray">Texto superior</label>
                <input
                  type="text"
                  value={form.banner.textTop}
                  onChange={(e) => updateBanner({ textTop: e.target.value })}
                  className="mt-1 w-full rounded-md border border-white/10 bg-brand-navy px-3 py-2 text-sm"
                  placeholder="Fome?"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray">Texto principal</label>
                <input
                  type="text"
                  value={form.banner.textBottom}
                  onChange={(e) => updateBanner({ textBottom: e.target.value })}
                  className="mt-1 w-full rounded-md border border-white/10 bg-brand-navy px-3 py-2 text-sm"
                  placeholder="Pede que chega rápido."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-brand-gray">Subtitulo</label>
              <input
                type="text"
                value={form.banner.subtitle}
                onChange={(e) => updateBanner({ subtitle: e.target.value })}
                className="mt-1 w-full rounded-md border border-white/10 bg-brand-navy px-3 py-2 text-sm"
                placeholder="Seu pedido em poucos cliques..."
              />
            </div>

            <ImageUploader
              label="Imagem de fundo do banner"
              value={form.banner.imageUrl}
              onChange={(url) => updateBanner({ imageUrl: url })}
              onUpload={(file) => handleImageUpload('bannerImageUrl', file)}
              previewClass="h-36"
              hint="Envie um arquivo ou cole uma URL. Essa imagem aparece atras do texto."
            />

            <ImageUploader
              label="Foto lateral do banner (opcional)"
              value={form.banner.sideImageUrl}
              onChange={(url) => updateBanner({ sideImageUrl: url })}
              onUpload={(file) => handleImageUpload('bannerSideImageUrl', file)}
              previewClass="h-36"
              hint="Essa foto aparece ao lado de 'Fome? Pede que chega rápido.'."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-brand-gray">Altura do banner</label>
                  <span className="text-xs font-mono text-brand-yellow">{clampBannerHeight(form.banner.height)}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={BANNER_HEIGHT_MIN}
                    max={BANNER_HEIGHT_MAX}
                    step={2}
                    value={clampBannerHeight(form.banner.height)}
                    onChange={(e) => updateBanner({ height: clampBannerHeight(Number(e.target.value)) })}
                    className="flex-1 accent-brand-yellow"
                  />
                  <input
                    type="number"
                    min={BANNER_HEIGHT_MIN}
                    max={BANNER_HEIGHT_MAX}
                    value={clampBannerHeight(form.banner.height)}
                    onChange={(e) => updateBanner({ height: clampBannerHeight(Number(e.target.value)) })}
                    className="w-16 rounded border border-white/10 bg-brand-navy px-2 py-1 text-center text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-brand-gray">Tamanho da fonte</label>
                  <span className="text-xs font-mono text-brand-yellow">{clampBannerFontSize(form.banner.fontSize)}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={BANNER_FONT_MIN}
                    max={BANNER_FONT_MAX}
                    step={1}
                    value={clampBannerFontSize(form.banner.fontSize)}
                    onChange={(e) => updateBanner({ fontSize: clampBannerFontSize(Number(e.target.value)) })}
                    className="flex-1 accent-brand-yellow"
                  />
                  <input
                    type="number"
                    min={BANNER_FONT_MIN}
                    max={BANNER_FONT_MAX}
                    value={clampBannerFontSize(form.banner.fontSize)}
                    onChange={(e) => updateBanner({ fontSize: clampBannerFontSize(Number(e.target.value)) })}
                    className="w-16 rounded border border-white/10 bg-brand-navy px-2 py-1 text-center text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-brand-gray">Opacidade da imagem</label>
                  <span className="text-xs font-mono text-brand-yellow">{clampPercent(form.banner.imageOpacity, DEFAULT_SETTINGS.banner.imageOpacity)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={clampPercent(form.banner.imageOpacity, DEFAULT_SETTINGS.banner.imageOpacity)}
                    onChange={(e) => updateBanner({ imageOpacity: clampPercent(Number(e.target.value), DEFAULT_SETTINGS.banner.imageOpacity) })}
                    className="flex-1 accent-brand-yellow"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={clampPercent(form.banner.imageOpacity, DEFAULT_SETTINGS.banner.imageOpacity)}
                    onChange={(e) => updateBanner({ imageOpacity: clampPercent(Number(e.target.value), DEFAULT_SETTINGS.banner.imageOpacity) })}
                    className="w-16 rounded border border-white/10 bg-brand-navy px-2 py-1 text-center text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-brand-gray">Opacidade da cor de fundo</label>
                  <span className="text-xs font-mono text-brand-yellow">{clampPercent(form.banner.overlayOpacity, DEFAULT_SETTINGS.banner.overlayOpacity)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={clampPercent(form.banner.overlayOpacity, DEFAULT_SETTINGS.banner.overlayOpacity)}
                    onChange={(e) => updateBanner({ overlayOpacity: clampPercent(Number(e.target.value), DEFAULT_SETTINGS.banner.overlayOpacity) })}
                    className="flex-1 accent-brand-yellow"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={clampPercent(form.banner.overlayOpacity, DEFAULT_SETTINGS.banner.overlayOpacity)}
                    onChange={(e) => updateBanner({ overlayOpacity: clampPercent(Number(e.target.value), DEFAULT_SETTINGS.banner.overlayOpacity) })}
                    className="w-16 rounded border border-white/10 bg-brand-navy px-2 py-1 text-center text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-brand-gray">Fonte do banner</label>
                <select
                  value={form.banner.fontFamily}
                  onChange={(e) => updateBanner({ fontFamily: e.target.value })}
                  className="mt-1 w-full rounded-md border border-white/10 bg-brand-navy px-3 py-2 text-sm"
                >
                  {BANNER_FONT_OPTIONS.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: fontFamilyStyle(font) }}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-gray">Cor de fundo do banner</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={form.banner.overlayColor}
                    onChange={(e) => updateBanner({ overlayColor: e.target.value })}
                    className="h-10 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={form.banner.overlayColor}
                    onChange={(e) => updateBanner({ overlayColor: e.target.value })}
                    className="w-full rounded-md border border-white/10 bg-brand-navy px-3 py-2 text-sm font-mono"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-gray">Cores de cada palavra</label>
              <div className="grid gap-3 sm:grid-cols-4">
                {ensureWordColors(form.banner.wordColors).map((color, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-xs text-brand-gray">Palavra {idx + 1}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateBannerWordColor(idx, e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded border border-white/10 bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateBannerWordColor(idx, e.target.value)}
                        className="w-full rounded-md border border-white/10 bg-brand-navy px-2 py-1 text-xs font-mono"
                        maxLength={7}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-gray">Preview do banner</p>
              {form.banner.enabled ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/10" style={{ minHeight: clampBannerHeight(form.banner.height) }}>
                  {form.banner.imageUrl?.trim() ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url("${form.banner.imageUrl.trim()}")`,
                        opacity: clampPercent(form.banner.imageOpacity, DEFAULT_SETTINGS.banner.imageOpacity) / 100,
                      }}
                    />
                  ) : null}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: hexToRgba(
                        form.banner.overlayColor,
                        clampPercent(form.banner.overlayOpacity, DEFAULT_SETTINGS.banner.overlayOpacity),
                      ),
                    }}
                  />
                  <div className={`relative z-10 h-full items-center gap-4 px-5 py-4 ${form.banner.sideImageUrl?.trim() ? 'grid md:grid-cols-[minmax(0,1fr)_220px]' : 'flex flex-col justify-center'}`}>
                    <div className="space-y-2">
                      <p
                        className="uppercase tracking-[0.06em]"
                        style={{ fontFamily: fontFamilyStyle(form.banner.fontFamily), fontSize: clampBannerFontSize(form.banner.fontSize), lineHeight: 1.05 }}
                      >
                        {colorizeWords(form.banner.textTop, ensureWordColors(form.banner.wordColors), 0)}
                        {splitWords(form.banner.textTop).length > 0 && splitWords(form.banner.textBottom).length > 0 ? ' ' : ''}
                        {colorizeWords(form.banner.textBottom, ensureWordColors(form.banner.wordColors), splitWords(form.banner.textTop).length)}
                      </p>
                      <p className="max-w-2xl text-sm text-brand-gray">{form.banner.subtitle}</p>
                    </div>
                    {form.banner.sideImageUrl?.trim() ? (
                      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
                        <img
                          src={form.banner.sideImageUrl.trim()}
                          alt="Preview foto lateral"
                          className="h-36 w-full object-cover md:h-44"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/5 px-4 py-6 text-sm text-brand-gray">
                  Banner desativado. Ative para ver o preview e publicar no site.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Colors + Background Section */}
        <section className="card-surface space-y-4 p-6">
          <div className="flex items-center gap-2 text-brand-yellow">
            <Palette size={20} />
            <h2 className="text-lg font-semibold">Cores e Fundo</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ColorPicker label="Fundo principal" value={form.colors.navy} onChange={(v) => updateColor('navy', v)} />
            <ColorPicker label="Cards / Superfícies" value={form.colors.navy2} onChange={(v) => updateColor('navy2', v)} />
            <ColorPicker label="Botão primário (CTA)" value={form.colors.red} onChange={(v) => updateColor('red', v)} />
            <ColorPicker label="Botão hover" value={form.colors.red2} onChange={(v) => updateColor('red2', v)} />
            <ColorPicker label="Destaque / Accent" value={form.colors.yellow} onChange={(v) => updateColor('yellow', v)} />
            <ColorPicker label="Texto secundário" value={form.colors.gray} onChange={(v) => updateColor('gray', v)} />
            <ColorPicker label="Texto principal" value={form.colors.white} onChange={(v) => updateColor('white', v)} />
          </div>

          <div className="border-t border-white/10 pt-4">
            <ImageUploader
              label="Imagem / Textura de fundo do site"
              value={form.backgroundImageUrl}
              onChange={(url) => setForm((prev) => ({ ...prev, backgroundImageUrl: url }))}
              onUpload={(file) => handleImageUpload('backgroundImageUrl', file)}
              previewClass="h-28"
              hint="Será exibida com opacidade baixa atrás do conteúdo. Texturas e padrões funcionam melhor."
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-brand-gray">Opacidade da textura de fundo</label>
                <span className="text-xs font-mono text-brand-yellow">
                  {clampBackgroundOpacity(form.backgroundImageOpacity)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={BG_OPACITY_MIN}
                  max={BG_OPACITY_MAX}
                  step={1}
                  value={clampBackgroundOpacity(form.backgroundImageOpacity)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      backgroundImageOpacity: clampBackgroundOpacity(Number(e.target.value)),
                    }))
                  }
                  className="flex-1 accent-brand-yellow"
                />
                <input
                  type="number"
                  min={BG_OPACITY_MIN}
                  max={BG_OPACITY_MAX}
                  value={clampBackgroundOpacity(form.backgroundImageOpacity)}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      backgroundImageOpacity: clampBackgroundOpacity(Number(e.target.value)),
                    }))
                  }
                  className="w-16 rounded border border-white/10 bg-brand-navy px-2 py-1 text-center text-xs font-mono"
                />
              </div>
              <p className="text-xs text-brand-gray/60">0% oculta a textura. 100% deixa a textura totalmente visivel.</p>
            </div>
          </div>
        </section>

        {/* Fonts Section */}
        <section className="card-surface space-y-4 p-6">
          <div className="flex items-center gap-2 text-brand-yellow">
            <Type size={20} />
            <h2 className="text-lg font-semibold">Fontes</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brand-gray">Fonte do corpo (textos)</label>
              <select
                value={form.fontBody}
                onChange={(e) => setForm((prev) => ({ ...prev, fontBody: e.target.value }))}
                className="mt-1 w-full rounded-md border border-white/10 bg-brand-navy px-3 py-2 text-sm"
              >
                {FONT_BODY_OPTIONS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: fontFamilyStyle(font) }}>{font}</option>
                ))}
              </select>
              <div className="mt-2 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-base" style={{ fontFamily: fontFamilyStyle(form.fontBody) }}>
                  Aa Bb Cc Dd Ee Ff Gg 0123456789
                </p>
                <p className="mt-1 text-sm text-brand-gray" style={{ fontFamily: fontFamilyStyle(form.fontBody) }}>
                  Texto de exemplo com a fonte {form.fontBody}. Seu sabor favorito, na sua porta.
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-brand-gray">Fonte dos títulos</label>
              <select
                value={form.fontHeading}
                onChange={(e) => setForm((prev) => ({ ...prev, fontHeading: e.target.value }))}
                className="mt-1 w-full rounded-md border border-white/10 bg-brand-navy px-3 py-2 text-sm"
              >
                {FONT_HEADING_OPTIONS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: fontFamilyStyle(font), fontWeight: resolveHeadingFontWeight(font) }}>{font}</option>
                ))}
              </select>
              <div className="mt-2 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-2xl font-bold uppercase" style={{ fontFamily: fontFamilyStyle(form.fontHeading), fontWeight: resolveHeadingFontWeight(form.fontHeading) }}>
                  Sabor Express
                </p>
                <p className="mt-1 text-lg uppercase" style={{ fontFamily: fontFamilyStyle(form.fontHeading), fontWeight: resolveHeadingFontWeight(form.fontHeading) }}>
                  Título de exemplo com {form.fontHeading}
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
