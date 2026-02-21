import { ApiListResult, AuditLogItem, Coupon, InventoryMovement } from '../types/common.types';
import { Category, Product } from '../types/product.types';
import { Order } from '../types/order.types';
import { UserProfile } from '../types/auth.types';
import { apiRequest } from './client';

export const adminApi = {
  products: {
    list: () => apiRequest<ApiListResult<Product>>('/products'),
    create: (payload: Partial<Product>) => apiRequest<Product>('/products', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: Partial<Product>) => apiRequest<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => apiRequest<Category[]>('/categories'),
    create: (payload: Partial<Category>) => apiRequest<Category>('/categories', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: Partial<Category>) => apiRequest<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: (id: string) => apiRequest<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
  },
  inventory: {
    list: () => apiRequest<InventoryMovement[]>('/inventory/movements'),
    move: (payload: { productId: string; type: 'IN' | 'OUT' | 'ADJUSTMENT'; quantity: number; reason?: string }) =>
      apiRequest('/inventory/movements', { method: 'POST', body: JSON.stringify(payload) }),
  },
  orders: {
    listAll: () => apiRequest<Order[]>('/orders'),
    listMine: () => apiRequest<Order[]>('/orders/me'),
    updateStatus: (id: string, status: string) => apiRequest<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  delivery: {
    createZone: (payload: { name: string; fee: number; minOrderValue?: number; isActive?: boolean }) =>
      apiRequest('/admin/delivery/zones', { method: 'POST', body: JSON.stringify(payload) }),
    createNeighborhood: (payload: { name: string; deliveryZoneId: string; isActive?: boolean }) =>
      apiRequest('/admin/delivery/neighborhoods', { method: 'POST', body: JSON.stringify(payload) }),
    createSlot: (payload: { startAt: string; endAt: string; capacity: number; isActive?: boolean }) =>
      apiRequest('/admin/delivery/slots', { method: 'POST', body: JSON.stringify(payload) }),
  },
  coupons: {
    list: () => apiRequest<Coupon[]>('/coupons'),
    create: (payload: Coupon) => apiRequest<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(payload) }),
  },
  users: {
    me: () => apiRequest<UserProfile>('/users/me'),
  },
  audit: {
    list: () => apiRequest<ApiListResult<AuditLogItem>>('/audit-logs'),
  },
};
