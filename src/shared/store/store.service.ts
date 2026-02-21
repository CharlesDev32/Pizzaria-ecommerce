import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import * as argon2 from 'argon2';
import { Role } from '../../common/types/auth.types';

export interface StoreSettingsRecord {
  brandName: string;
  showBrandName: boolean;
  logoUrl: string;
  logoSize: number;
  heroImageUrl: string;
  backgroundImageUrl: string;
  backgroundImageOpacity: number;
  colors: { navy: string; navy2: string; red: string; red2: string; yellow: string; gray: string; white: string };
  fontBody: string;
  fontHeading: string;
  banner: {
    enabled: boolean;
    textTop: string;
    textBottom: string;
    subtitle: string;
    imageUrl: string;
    sideImageUrl: string;
    imageOpacity: number;
    height: number;
    overlayColor: string;
    overlayOpacity: number;
    fontFamily: string;
    fontSize: number;
    wordColors: string[];
  };
}

export type ProductStatus = 'draft' | 'active';
export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type CouponType = 'percentage' | 'fixed';
export type OrderStatus = 'received' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'canceled';
export type PaymentMethod = 'cash_on_delivery' | 'card_on_delivery';
export type OrderType = 'delivery';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  refreshTokenHash: string;
  tokenFamily: string;
  revokedAt?: string;
  expiresAt: string;
}

export interface CategoryRecord { id: string; name: string; slug: string; description?: string; }
export interface ProductRecord {
  id: string;
  sku: string;
  title: string;
  description?: string;
  slug: string;
  price: number;
  promoPrice?: number;
  status: ProductStatus;
  categoryId?: string;
  tags: string[];
  images: { id: string; url: string; objectKey: string; mimeType: string; sizeBytes: number }[];
  imageScale?: number;
  imagePositionX?: number;
  imagePositionY?: number;
  optionGroups?: MenuOptionGroupRecord[];
}

export interface MovementRecord { id: string; productId: string; type: InventoryMovementType; quantity: number; reason?: string; createdAt: string; }

export interface CartItemRecord {
  id: string;
  productId: string;
  quantity: number;
  unitPriceSnapshot: number;
  selectedOptions: { groupId: string; optionId: string }[];
}
export interface CartRecord { id: string; userId?: string; guestToken?: string; items: CartItemRecord[]; couponCode?: string; updatedAt: string; }

export interface CouponRecord {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  expiresAt?: string;
  usageLimitGlobal?: number;
  usageLimitPerUser?: number;
  usedGlobal: number;
}

export interface OrderItemRecord {
  id: string;
  productId: string;
  titleSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  options: OrderItemOptionRecord[];
}
export interface OrderItemOptionRecord {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}
export interface OrderRecord {
  id: string;
  userId: string;
  orderType: OrderType;
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  couponCode?: string;
  idempotencyKey: string;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  notes?: string;
  scheduledAt?: string;
  slotId?: string;
  addressSnapshot: AddressSnapshotRecord;
  items: OrderItemRecord[];
  timeline: { id: string; fromStatus?: OrderStatus; toStatus: OrderStatus; createdAt: string; note?: string }[];
}

export interface AddressSnapshotRecord {
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhoodName: string;
  zoneName: string;
}

export interface DeliveryZoneRecord {
  id: string;
  name: string;
  fee: number;
  minOrderValue?: number;
  isActive: boolean;
}

export interface NeighborhoodRecord {
  id: string;
  name: string;
  deliveryZoneId: string;
  isActive: boolean;
}

export interface CustomerAddressRecord {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhoodId: string;
  reference?: string;
  isDefault: boolean;
}

export interface MenuOptionGroupRecord {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: MenuOptionRecord[];
}

export interface MenuOptionRecord {
  id: string;
  name: string;
  priceDelta: number;
  isActive: boolean;
}

export interface DeliverySlotRecord {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  isActive: boolean;
  usedCapacity: number;
}

export interface PaymentIntentRecord {
  id: string;
  orderId: string;
  provider: 'FAKE' | 'STRIPE' | 'MERCADOPAGO';
  status: 'REQUIRES_ACTION' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  amount: number;
}

export interface AuditRecord {
  id: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
}

@Injectable()
export class StoreService implements OnModuleInit {
  private readonly settingsFilePath = join(process.cwd(), 'data', 'store-settings.json');
  users: UserRecord[] = [];
  sessions: SessionRecord[] = [];
  categories: CategoryRecord[] = [];
  products: ProductRecord[] = [];
  movements: MovementRecord[] = [];
  carts: CartRecord[] = [];
  coupons: CouponRecord[] = [];
  orders: OrderRecord[] = [];
  paymentIntents: PaymentIntentRecord[] = [];
  audit: AuditRecord[] = [];
  deliveryZones: DeliveryZoneRecord[] = [];
  neighborhoods: NeighborhoodRecord[] = [];
  customerAddresses: CustomerAddressRecord[] = [];
  deliverySlots: DeliverySlotRecord[] = [];
  passwordResetTokens: { id: string; userId: string; token: string; expiresAt: string; used: boolean }[] = [];
  settings: StoreSettingsRecord = {
    brandName: 'Sabor Express',
    showBrandName: false,
    logoUrl: '/brand/logo.svg',
    logoSize: 52,
    heroImageUrl: '/brand/hero.svg',
    backgroundImageUrl: '',
    backgroundImageOpacity: 10,
    colors: { navy: '#090807', navy2: '#19100F', red: '#D0121F', red2: '#A60D18', yellow: '#F2DDBC', gray: '#D3C2AA', white: '#FFF7EA' },
    fontBody: 'Nunito',
    fontHeading: 'Oswald',
    banner: {
      enabled: true,
      textTop: 'Fome?',
      textBottom: 'Pede que chega rápido.',
      subtitle: 'Seu pedido em poucos cliques, com entrega por bairro e agendamento.',
      imageUrl: '',
      sideImageUrl: '',
      imageOpacity: 34,
      height: 230,
      overlayColor: '#090807',
      overlayOpacity: 58,
      fontFamily: 'Oswald',
      fontSize: 44,
      wordColors: ['#F2DDBC', '#FFF7EA', '#D0121F', '#F2DDBC', '#FFF7EA', '#D3C2AA'],
    },
  };

  async onModuleInit() {
    this.loadSettingsFromDisk();

    const adminPassword = await argon2.hash('Admin123!');
    this.users.push({
      id: this.id(),
      email: 'admin@pizzainpizza.local',
      passwordHash: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
      createdAt: this.now(),
    });
    const customerPassword = await argon2.hash('Customer123!');
    this.users.push({
      id: this.id(),
      email: 'cliente@saborexpress.com',
      passwordHash: customerPassword,
      name: 'Cliente Teste',
      role: 'CUSTOMER',
      createdAt: this.now(),
    });

    this.deliveryZones.push({ id: 'zona-central', name: 'Zona Central', fee: 8.5, minOrderValue: 25, isActive: true });
    this.neighborhoods.push({ id: 'centro', name: 'Centro', deliveryZoneId: 'zona-central', isActive: true });
    this.neighborhoods.push({ id: 'jardim-america', name: 'Jardim América', deliveryZoneId: 'zona-central', isActive: true });

    this.categories.push({ id: 'cat-lanches', name: 'Lanches', slug: 'lanches', description: 'Hambúrgueres e sanduíches' });
    this.categories.push({ id: 'cat-pizzas', name: 'Pizzas', slug: 'pizzas', description: 'Pizzas artesanais' });
    this.categories.push({ id: 'cat-bebidas', name: 'Bebidas', slug: 'bebidas', description: 'Refrigerantes, sucos e mais' });
    this.categories.push({ id: 'cat-sobremesas', name: 'Sobremesas', slug: 'sobremesas', description: 'Doces e sobremesas' });

    this.products.push({
      id: 'prod-xburguer', sku: 'XBURG-001', title: 'X-Burguer Clássico',
      description: 'Pão, hambúrguer 180g, queijo, alface, tomate e maionese especial',
      slug: 'x-burguer-classico', price: 28.9, status: 'active', categoryId: 'cat-lanches', tags: ['destaque'],
      images: [{ id: 'img-xburg', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', objectKey: '', mimeType: 'image/jpeg', sizeBytes: 0 }],
      optionGroups: [
        { id: 'og-xburg-extra', name: 'Adicionais', minSelect: 0, maxSelect: 3, isRequired: false, options: [
          { id: 'opt-bacon', name: 'Bacon', priceDelta: 5, isActive: true },
          { id: 'opt-ovo', name: 'Ovo', priceDelta: 3, isActive: true },
          { id: 'opt-cheddar', name: 'Cheddar', priceDelta: 4, isActive: true },
        ]},
      ],
    });
    this.products.push({
      id: 'prod-pizza-marg', sku: 'PIZZA-001', title: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela de búfala, manjericão fresco e azeite',
      slug: 'pizza-margherita', price: 45.9, status: 'active', categoryId: 'cat-pizzas', tags: ['destaque'],
      images: [{ id: 'img-marg', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop', objectKey: '', mimeType: 'image/jpeg', sizeBytes: 0 }],
      optionGroups: [
        { id: 'og-pizza-size', name: 'Tamanho', minSelect: 1, maxSelect: 1, isRequired: true, options: [
          { id: 'opt-media', name: 'Média (6 fatias)', priceDelta: 0, isActive: true },
          { id: 'opt-grande', name: 'Grande (8 fatias)', priceDelta: 12, isActive: true },
          { id: 'opt-familia', name: 'Família (12 fatias)', priceDelta: 22, isActive: true },
        ]},
        { id: 'og-pizza-borda', name: 'Borda', minSelect: 0, maxSelect: 1, isRequired: false, options: [
          { id: 'opt-borda-catupiry', name: 'Catupiry', priceDelta: 8, isActive: true },
          { id: 'opt-borda-cheddar', name: 'Cheddar', priceDelta: 8, isActive: true },
        ]},
      ],
    });
    this.products.push({
      id: 'prod-pizza-4q', sku: 'PIZZA-002', title: 'Pizza Quatro Queijos',
      description: 'Mussarela, provolone, gorgonzola e parmesão',
      slug: 'pizza-quatro-queijos', price: 49.9, status: 'active', categoryId: 'cat-pizzas', tags: [],
      images: [{ id: 'img-4q', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop', objectKey: '', mimeType: 'image/jpeg', sizeBytes: 0 }],
      optionGroups: [
        { id: 'og-4q-size', name: 'Tamanho', minSelect: 1, maxSelect: 1, isRequired: true, options: [
          { id: 'opt-4q-media', name: 'Média (6 fatias)', priceDelta: 0, isActive: true },
          { id: 'opt-4q-grande', name: 'Grande (8 fatias)', priceDelta: 12, isActive: true },
        ]},
      ],
    });
    this.products.push({
      id: 'prod-refri', sku: 'BEB-001', title: 'Refrigerante 600ml',
      description: 'Coca-Cola, Guaraná ou Fanta',
      slug: 'refrigerante-600ml', price: 8.9, status: 'active', categoryId: 'cat-bebidas', tags: [],
      images: [{ id: 'img-refri', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=400&fit=crop', objectKey: '', mimeType: 'image/jpeg', sizeBytes: 0 }],
    });
    this.products.push({
      id: 'prod-suco', sku: 'BEB-002', title: 'Suco Natural 500ml',
      description: 'Laranja, maracujá ou limão',
      slug: 'suco-natural-500ml', price: 12.9, status: 'active', categoryId: 'cat-bebidas', tags: [],
      images: [{ id: 'img-suco', url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=400&fit=crop', objectKey: '', mimeType: 'image/jpeg', sizeBytes: 0 }],
      optionGroups: [
        { id: 'og-suco-sabor', name: 'Sabor', minSelect: 1, maxSelect: 1, isRequired: true, options: [
          { id: 'opt-laranja', name: 'Laranja', priceDelta: 0, isActive: true },
          { id: 'opt-maracuja', name: 'Maracujá', priceDelta: 0, isActive: true },
          { id: 'opt-limao', name: 'Limão', priceDelta: 0, isActive: true },
        ]},
      ],
    });
    this.products.push({
      id: 'prod-brownie', sku: 'SOBR-001', title: 'Brownie com Sorvete',
      description: 'Brownie de chocolate quente com bola de sorvete de creme',
      slug: 'brownie-com-sorvete', price: 18.9, status: 'active', categoryId: 'cat-sobremesas', tags: ['destaque'],
      images: [{ id: 'img-brownie', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop', objectKey: '', mimeType: 'image/jpeg', sizeBytes: 0 }],
    });
  }

  now(): string {
    return new Date().toISOString();
  }

  id(): string {
    return randomUUID();
  }

  private loadSettingsFromDisk(): void {
    try {
      if (!existsSync(this.settingsFilePath)) return;

      const raw = readFileSync(this.settingsFilePath, 'utf-8');
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<StoreSettingsRecord>;
      this.settings = {
        ...this.settings,
        ...parsed,
        colors: { ...this.settings.colors, ...(parsed.colors ?? {}) },
        banner: { ...this.settings.banner, ...(parsed.banner ?? {}) },
      };
    } catch {
      // Ignore malformed/unreadable settings file and keep in-memory defaults.
    }
  }

  persistSettings(): void {
    try {
      const dir = dirname(this.settingsFilePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.settingsFilePath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch {
      // Ignore write errors so API keeps running even if filesystem is unavailable.
    }
  }
}
