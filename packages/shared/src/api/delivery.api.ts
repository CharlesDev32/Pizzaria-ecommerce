import { apiRequest } from './client';

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  minOrderValue?: number;
  isActive: boolean;
}

export interface Neighborhood {
  id: string;
  name: string;
  deliveryZoneId: string;
  isActive: boolean;
}

export interface DeliverySlotItem {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  isActive: boolean;
  usedCapacity: number;
}

export const deliveryApi = {
  listZones: () => apiRequest<DeliveryZone[]>('/delivery/zones'),
  listNeighborhoods: () => apiRequest<Neighborhood[]>('/delivery/neighborhoods'),
  listSlots: (date?: string) => apiRequest<DeliverySlotItem[]>(`/delivery/slots${date ? `?date=${encodeURIComponent(date)}` : ''}`),
};
