import { DeliveryAddress } from '../types/order.types';
import { apiRequest } from './client';

export const addressesApi = {
  list: () => apiRequest<DeliveryAddress[]>('/addresses'),
  create: (payload: Omit<DeliveryAddress, 'id'>) => apiRequest<DeliveryAddress>('/addresses', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Omit<DeliveryAddress, 'id'>>) =>
    apiRequest<DeliveryAddress>(`/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

