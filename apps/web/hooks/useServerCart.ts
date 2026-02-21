'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@pizza/shared';
import { useAuthStore } from '@/store/auth.store';

const CART_KEY = ['server-cart'] as const;

export function useServerCart() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);

  const cartQuery = useQuery({
    queryKey: CART_KEY,
    queryFn: () => cartApi.get(),
    enabled: !!token,
    staleTime: 30_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: CART_KEY });

  const addItem = useMutation({
    mutationFn: (input: { productId: string; quantity: number; selectedOptions?: Array<{ groupId: string; optionId: string }> }) =>
      cartApi.addItem(input),
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: invalidate,
  });

  const applyCoupon = useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    onSuccess: invalidate,
  });

  const cart = cartQuery.data ?? null;
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart,
    itemCount,
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    addItem,
    updateItem,
    removeItem,
    applyCoupon,
    invalidate,
  };
}
