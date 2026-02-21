import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class CatalogService {
  constructor(private readonly store: StoreService) {}

  private clampRange(value: unknown, min: number, max: number, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, Math.min(max, parsed));
  }

  create(input: {
    sku: string;
    title: string;
    description?: string;
    slug: string;
    price: number;
    promoPrice?: number;
    status?: 'draft' | 'active';
    categoryId?: string;
    tags?: string[];
    imageScale?: number;
    imagePositionX?: number;
    imagePositionY?: number;
    optionGroups?: Array<{
      name: string;
      minSelect?: number;
      maxSelect?: number;
      isRequired?: boolean;
      options: Array<{ name: string; priceDelta?: number; isActive?: boolean }>;
    }>;
  }) {
    const product = {
      id: this.store.id(),
      sku: input.sku,
      title: input.title,
      description: input.description,
      slug: input.slug,
      price: Number(input.price),
      promoPrice: input.promoPrice,
      status: input.status ?? 'draft',
      categoryId: input.categoryId,
      tags: input.tags ?? [],
      images: [],
      imageScale: this.clampRange(input.imageScale, 0.5, 3, 1),
      imagePositionX: this.clampRange(input.imagePositionX, 0, 100, 50),
      imagePositionY: this.clampRange(input.imagePositionY, 0, 100, 50),
      optionGroups: (input.optionGroups ?? []).map((group) => ({
        id: this.store.id(),
        name: group.name,
        minSelect: group.minSelect ?? 0,
        maxSelect: group.maxSelect ?? Math.max(1, group.options.length),
        isRequired: group.isRequired ?? false,
        options: group.options.map((option) => ({
          id: this.store.id(),
          name: option.name,
          priceDelta: Number(option.priceDelta ?? 0),
          isActive: option.isActive ?? true,
        })),
      })),
    };

    this.store.products.push(product);
    return product;
  }

  list(query: { search?: string; categoryId?: string; minPrice?: string; maxPrice?: string; sort?: string; page?: string; limit?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Math.min(Number(query.limit ?? 20), 100);
    let items = [...this.store.products];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s));
    }
    if (query.categoryId) items = items.filter((p) => p.categoryId === query.categoryId);
    if (query.minPrice) items = items.filter((p) => p.price >= Number(query.minPrice));
    if (query.maxPrice) items = items.filter((p) => p.price <= Number(query.maxPrice));
    if (query.sort === 'price_asc') items.sort((a, b) => a.price - b.price);
    if (query.sort === 'price_desc') items.sort((a, b) => b.price - a.price);

    const total = items.length;
    const paged = items.slice((page - 1) * limit, page * limit);
    return { data: paged, page, limit, total };
  }

  update(
    id: string,
    input: Partial<{
      title: string;
      description: string;
      price: number;
      promoPrice: number;
      status: 'draft' | 'active';
      tags: string[];
      imageScale: number;
      imagePositionX: number;
      imagePositionY: number;
      optionGroups: Array<{
        id?: string;
        name: string;
        minSelect?: number;
        maxSelect?: number;
        isRequired?: boolean;
        options: Array<{ id?: string; name: string; priceDelta?: number; isActive?: boolean }>;
      }>;
    }>,
  ) {
    const product = this.store.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product not found');
    const { optionGroups, imageScale, imagePositionX, imagePositionY, ...rest } = input;
    Object.assign(product, rest);
    if (imageScale !== undefined) {
      product.imageScale = this.clampRange(imageScale, 0.5, 3, product.imageScale ?? 1);
    }
    if (imagePositionX !== undefined) {
      product.imagePositionX = this.clampRange(imagePositionX, 0, 100, product.imagePositionX ?? 50);
    }
    if (imagePositionY !== undefined) {
      product.imagePositionY = this.clampRange(imagePositionY, 0, 100, product.imagePositionY ?? 50);
    }
    if (optionGroups) {
      product.optionGroups = optionGroups.map((group) => ({
        id: group.id ?? this.store.id(),
        name: group.name,
        minSelect: group.minSelect ?? 0,
        maxSelect: group.maxSelect ?? Math.max(1, group.options.length),
        isRequired: group.isRequired ?? false,
        options: group.options.map((option) => ({
          id: option.id ?? this.store.id(),
          name: option.name,
          priceDelta: Number(option.priceDelta ?? 0),
          isActive: option.isActive ?? true,
        })),
      }));
    }
    return product;
  }

  remove(id: string) {
    this.store.products = this.store.products.filter((p) => p.id !== id);
    return { success: true };
  }

  addImage(productId: string, image: { url: string; objectKey: string; mimeType: string; sizeBytes: number }) {
    const product = this.store.products.find((p) => p.id === productId);
    if (!product) throw new NotFoundException('Product not found');

    const item = { id: this.store.id(), ...image };
    product.images.push(item);
    return item;
  }
}
