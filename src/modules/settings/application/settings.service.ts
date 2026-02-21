import { BadRequestException, Injectable } from '@nestjs/common';
import { StoreService, StoreSettingsRecord } from '../../../shared/store/store.service';

@Injectable()
export class SettingsService {
  constructor(private readonly store: StoreService) {}

  private clampPercent(value: unknown, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.min(100, Math.round(parsed)));
  }

  private clampRange(value: unknown, min: number, max: number, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, Math.min(max, Math.round(parsed)));
  }

  get(): StoreSettingsRecord {
    return this.store.settings;
  }

  update(partial: Partial<StoreSettingsRecord>): StoreSettingsRecord {
    if (partial.brandName !== undefined) this.store.settings.brandName = partial.brandName;
    if (partial.showBrandName !== undefined) {
      const raw: unknown = partial.showBrandName;
      this.store.settings.showBrandName =
        typeof raw === 'string' ? raw.toLowerCase() === 'true' : Boolean(raw);
    }
    if (partial.logoUrl !== undefined) this.store.settings.logoUrl = partial.logoUrl;
    if (partial.logoSize !== undefined) this.store.settings.logoSize = partial.logoSize;
    if (partial.heroImageUrl !== undefined) this.store.settings.heroImageUrl = partial.heroImageUrl;
    if (partial.backgroundImageUrl !== undefined) this.store.settings.backgroundImageUrl = partial.backgroundImageUrl;
    if (partial.backgroundImageOpacity !== undefined) {
      const parsed = Number(partial.backgroundImageOpacity);
      if (Number.isFinite(parsed)) {
        this.store.settings.backgroundImageOpacity = Math.max(0, Math.min(100, parsed));
      }
    }
    if (partial.fontBody !== undefined) this.store.settings.fontBody = partial.fontBody;
    if (partial.fontHeading !== undefined) this.store.settings.fontHeading = partial.fontHeading;
    if (partial.banner) {
      const nextBanner = { ...this.store.settings.banner, ...partial.banner };
      nextBanner.imageOpacity = this.clampPercent(nextBanner.imageOpacity, this.store.settings.banner.imageOpacity);
      nextBanner.overlayOpacity = this.clampPercent(nextBanner.overlayOpacity, this.store.settings.banner.overlayOpacity);
      nextBanner.height = this.clampRange(nextBanner.height, 120, 520, this.store.settings.banner.height);
      nextBanner.fontSize = this.clampRange(nextBanner.fontSize, 20, 96, this.store.settings.banner.fontSize);
      nextBanner.wordColors = Array.isArray(nextBanner.wordColors)
        ? nextBanner.wordColors.filter((item) => typeof item === 'string' && item.trim().length > 0).slice(0, 12)
        : this.store.settings.banner.wordColors;
      if (nextBanner.wordColors.length === 0) {
        nextBanner.wordColors = this.store.settings.banner.wordColors;
      }
      this.store.settings.banner = nextBanner;
    }
    if (partial.colors) {
      this.store.settings.colors = { ...this.store.settings.colors, ...partial.colors };
    }
    this.store.persistSettings();
    return this.store.settings;
  }

  uploadImage(file: Express.Multer.File): { url: string } {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de arquivo não permitido. Use JPEG, PNG, WebP, SVG ou GIF.');
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Máximo 5MB.');
    }
    const base64 = file.buffer.toString('base64');
    return { url: `data:${file.mimetype};base64,${base64}` };
  }
}
