'use client';

import { DEFAULT_SETTINGS, resolveFontFamily } from '@pizza/shared';
import { useTheme } from '@/components/providers/ThemeProvider';

function clampPercent(value: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(100, parsed));
}

function clampRange(value: number, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function hexToRgba(hex: string, alphaPercent: number): string {
  const clean = (hex || '').replace('#', '').trim();
  const alpha = clampPercent(alphaPercent, 60) / 100;
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) return `rgba(9, 8, 7, ${alpha})`;
  const normalized = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.slice(0, 6);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function colorizeText(text: string, colors: string[], startIndex = 0) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const palette = colors.length > 0 ? colors : DEFAULT_SETTINGS.banner.wordColors;
  return words.map((word, i) => (
    <span key={`${word}-${i}`} style={{ color: palette[(startIndex + i) % palette.length] }}>
      {word}
      {i < words.length - 1 ? ' ' : ''}
    </span>
  ));
}

export function PromoBanner({ className = '' }: { className?: string }) {
  const theme = useTheme();
  const banner = { ...DEFAULT_SETTINGS.banner, ...(theme.banner ?? {}) };
  if (!banner.enabled) return null;

  const textTop = banner.textTop?.trim() || DEFAULT_SETTINGS.banner.textTop;
  const textBottom = banner.textBottom?.trim() || DEFAULT_SETTINGS.banner.textBottom;
  const subtitle = banner.subtitle?.trim() || DEFAULT_SETTINGS.banner.subtitle;
  const imageUrl = banner.imageUrl?.trim() || '';
  const sideImageUrl = banner.sideImageUrl?.trim() || '';
  const height = clampRange(banner.height, 120, 520, DEFAULT_SETTINGS.banner.height);
  const fontSize = clampRange(banner.fontSize, 20, 96, DEFAULT_SETTINGS.banner.fontSize);
  const imageOpacity = clampPercent(banner.imageOpacity, DEFAULT_SETTINGS.banner.imageOpacity);
  const overlayOpacity = clampPercent(banner.overlayOpacity, DEFAULT_SETTINGS.banner.overlayOpacity);
  const fontFamily = resolveFontFamily(banner.fontFamily || DEFAULT_SETTINGS.banner.fontFamily);
  const wordColors = Array.isArray(banner.wordColors) ? banner.wordColors.filter(Boolean) : DEFAULT_SETTINGS.banner.wordColors;
  const topWordsCount = textTop.split(/\s+/).filter(Boolean).length;
  const bottomWordsCount = textBottom.split(/\s+/).filter(Boolean).length;
  const hasSideImage = sideImageUrl.length > 0;

  return (
    <section className={`relative overflow-hidden rounded-2xl border border-brand ${className}`} style={{ minHeight: `${height}px` }}>
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${imageUrl}")`, opacity: imageOpacity / 100 }}
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: hexToRgba(banner.overlayColor, overlayOpacity) }}
      />
      <div className={`relative z-10 h-full items-center gap-4 px-5 py-4 sm:px-8 sm:py-6 ${hasSideImage ? 'grid md:grid-cols-[minmax(0,1fr)_320px]' : 'flex flex-col justify-center'}`}>
        <div className="space-y-2">
          <p
            className="uppercase tracking-[0.06em]"
            style={{ fontFamily: `'${fontFamily}', var(--font-heading), sans-serif`, fontSize: `${fontSize}px`, lineHeight: 1.05 }}
          >
            {colorizeText(textTop, wordColors, 0)}
            {topWordsCount > 0 && bottomWordsCount > 0 ? ' ' : ''}
            {colorizeText(textBottom, wordColors, topWordsCount)}
          </p>
          <p className="max-w-3xl text-sm text-brand-gray sm:text-base">{subtitle}</p>
        </div>
        {hasSideImage ? (
          <div className="overflow-hidden rounded-2xl border border-brand bg-black/25">
            <img
              src={sideImageUrl}
              alt="Banner lateral"
              className="h-40 w-full object-cover sm:h-48 md:h-52"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
