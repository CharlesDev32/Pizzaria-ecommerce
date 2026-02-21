import { Order } from '../types/order.types';
import { apiRequest } from './client';

export const checkoutApi = {
  create: (
    idempotencyKey: string,
    payload: {
      addressId: string;
      scheduledAt?: string;
      slotId?: string;
      paymentMethod: 'cash_on_delivery' | 'card_on_delivery';
      changeFor?: number;
      notes?: string;
    },
  ) =>
    apiRequest<Order>('/checkout', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(payload),
    }),
};
