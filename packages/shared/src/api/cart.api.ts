import { Cart } from '../types/order.types';
import { apiRequest } from './client';

export const cartApi = {
  get: () => apiRequest<Cart>('/cart'),
  addItem: (input: { productId: string; quantity: number; selectedOptions?: Array<{ groupId: string; optionId: string }> }) =>
    apiRequest<Cart>('/cart/items', { method: 'POST', body: JSON.stringify(input) }),
  updateItem: (itemId: string, quantity: number) =>
    apiRequest<Cart>(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeItem: (itemId: string) => apiRequest<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' }),
  applyCoupon: (code: string) =>
    apiRequest<Cart>('/cart/apply-coupon', { method: 'POST', body: JSON.stringify({ code }) }),
};
