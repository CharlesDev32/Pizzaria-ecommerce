import { Order } from '../types/order.types';
import { apiRequest } from './client';

export const ordersApi = {
  listMine: () => apiRequest<Order[]>('/orders/me'),
  getById: (id: string) => apiRequest<Order>(`/orders/${id}`),
  timeline: (id: string) => apiRequest<Order['timeline']>(`/orders/${id}/timeline`),
};
