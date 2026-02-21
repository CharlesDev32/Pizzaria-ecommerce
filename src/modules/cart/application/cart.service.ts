import { Injectable } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class CartService {
  constructor(private readonly store: StoreService) {}

  getCart(userId: string) {
    let cart = this.store.carts.find((c) => c.userId === userId);
    if (!cart) {
      cart = { id: this.store.id(), userId, items: [], updatedAt: this.store.now() };
      this.store.carts.push(cart);
    }
    return this.totals(cart);
  }

  addItem(userId: string, productId: string, quantity: number, selectedOptions: Array<{ groupId: string; optionId: string }> = []) {
    const cart = this.getOrCreate(userId);
    const product = this.store.products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');
    const optionGroups = product.optionGroups ?? [];
    this.validateSelections(optionGroups, selectedOptions);
    const optionPrice = this.resolveOptionPrice(optionGroups, selectedOptions);
    const unitPrice = (product.promoPrice ?? product.price) + optionPrice;
    const optionsKey = selectedOptions
      .map((option) => `${option.groupId}:${option.optionId}`)
      .sort()
      .join('|');

    const existing = cart.items.find((i) => {
      const key = i.selectedOptions
        .map((option) => `${option.groupId}:${option.optionId}`)
        .sort()
        .join('|');
      return i.productId === productId && key === optionsKey;
    });
    if (existing) existing.quantity += quantity;
    else cart.items.push({ id: this.store.id(), productId, quantity, unitPriceSnapshot: unitPrice, selectedOptions });
    cart.updatedAt = this.store.now();
    return this.totals(cart);
  }

  updateItem(userId: string, itemId: string, quantity: number) {
    const cart = this.getOrCreate(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item not found');
    item.quantity = quantity;
    cart.updatedAt = this.store.now();
    return this.totals(cart);
  }

  removeItem(userId: string, itemId: string) {
    const cart = this.getOrCreate(userId);
    cart.items = cart.items.filter((i) => i.id !== itemId);
    cart.updatedAt = this.store.now();
    return this.totals(cart);
  }

  applyCoupon(userId: string, code: string) {
    const cart = this.getOrCreate(userId);
    cart.couponCode = code.toUpperCase();
    return this.totals(cart);
  }

  clear(userId: string) {
    const cart = this.getOrCreate(userId);
    cart.items = [];
    cart.couponCode = undefined;
    cart.updatedAt = this.store.now();
  }

  private getOrCreate(userId: string) {
    let cart = this.store.carts.find((c) => c.userId === userId);
    if (!cart) {
      cart = { id: this.store.id(), userId, items: [], updatedAt: this.store.now() };
      this.store.carts.push(cart);
    }
    return cart;
  }

  totals(cart: {
    id: string;
    userId?: string;
    items: {
      id: string;
      productId: string;
      quantity: number;
      unitPriceSnapshot: number;
      selectedOptions?: Array<{ groupId: string; optionId: string }>;
    }[];
    couponCode?: string;
  }) {
    const subtotal = cart.items.reduce((acc, item) => acc + item.unitPriceSnapshot * item.quantity, 0);
    return { ...cart, subtotal };
  }

  private validateSelections(
    optionGroups: Array<{ id: string; minSelect: number; maxSelect: number; isRequired: boolean }>,
    selectedOptions: Array<{ groupId: string; optionId: string }>,
  ) {
    optionGroups.forEach((group) => {
      const selectedCount = selectedOptions.filter((selected) => selected.groupId === group.id).length;
      if (group.isRequired && selectedCount < Math.max(1, group.minSelect)) {
        throw new Error('Required option group is missing selections');
      }
      if (selectedCount < group.minSelect || selectedCount > group.maxSelect) {
        throw new Error('Option selection count is invalid');
      }
    });
  }

  private resolveOptionPrice(
    optionGroups: Array<{ id: string; options: Array<{ id: string; priceDelta: number; isActive: boolean }> }>,
    selectedOptions: Array<{ groupId: string; optionId: string }>,
  ) {
    let total = 0;
    selectedOptions.forEach((selected) => {
      const group = optionGroups.find((item) => item.id === selected.groupId);
      if (!group) throw new Error('Invalid option group');
      const option = group.options.find((item) => item.id === selected.optionId);
      if (!option || !option.isActive) throw new Error('Invalid option');
      total += option.priceDelta;
    });
    return total;
  }
}
