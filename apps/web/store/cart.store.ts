'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@pizza/shared';

interface CartState {
  items: CartItem[];
  couponCode: string;
  addItem: (item: CartItem) => void;
  updateQty: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  applyCoupon: (code: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: '',
      addItem: (item) =>
        set((state) => {
          const itemKey = (item.selectedOptions ?? [])
            .map((option) => `${option.groupId}:${option.optionId}`)
            .sort()
            .join('|');
          const found = state.items.find((i) => {
            const existingKey = (i.selectedOptions ?? [])
              .map((option) => `${option.groupId}:${option.optionId}`)
              .sort()
              .join('|');
            return i.productId === item.productId && itemKey === existingKey;
          });
          if (found) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      updateQty: (id, quantity) =>
        set((state) => ({ items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      applyCoupon: (code) => set(() => ({ couponCode: code })),
      clear: () => set(() => ({ items: [], couponCode: '' })),
    }),
    { name: 'pizza-cart' },
  ),
);
