import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class DeliveryService {
  constructor(private readonly store: StoreService) {}

  listZones() {
    return this.store.deliveryZones.filter((zone) => zone.isActive);
  }

  listNeighborhoods() {
    return this.store.neighborhoods.filter((neighborhood) => neighborhood.isActive);
  }

  listSlots(date?: string) {
    if (!date) return this.store.deliverySlots.filter((slot) => slot.isActive);
    return this.store.deliverySlots.filter((slot) => slot.isActive && slot.startAt.startsWith(date));
  }

  createZone(input: { name: string; fee: number; minOrderValue?: number; isActive?: boolean }) {
    const zone = {
      id: this.store.id(),
      name: input.name,
      fee: Number(input.fee),
      minOrderValue: input.minOrderValue !== undefined ? Number(input.minOrderValue) : undefined,
      isActive: input.isActive ?? true,
    };
    this.store.deliveryZones.push(zone);
    return zone;
  }

  createNeighborhood(input: { name: string; deliveryZoneId: string; isActive?: boolean }) {
    const zone = this.store.deliveryZones.find((item) => item.id === input.deliveryZoneId);
    if (!zone) throw new NotFoundException('Delivery zone not found');
    const neighborhood = {
      id: this.store.id(),
      name: input.name,
      deliveryZoneId: input.deliveryZoneId,
      isActive: input.isActive ?? true,
    };
    this.store.neighborhoods.push(neighborhood);
    return neighborhood;
  }

  createSlot(input: { startAt: string; endAt: string; capacity: number; isActive?: boolean }) {
    const start = new Date(input.startAt);
    const end = new Date(input.endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new BadRequestException('Invalid slot interval');
    }
    if (input.capacity <= 0) {
      throw new BadRequestException('Capacity must be greater than zero');
    }
    const slot = {
      id: this.store.id(),
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      capacity: input.capacity,
      isActive: input.isActive ?? true,
      usedCapacity: 0,
    };
    this.store.deliverySlots.push(slot);
    return slot;
  }

  resolveDeliveryForNeighborhood(neighborhoodId: string, subtotal: number) {
    const neighborhood = this.store.neighborhoods.find((item) => item.id === neighborhoodId && item.isActive);
    if (!neighborhood) throw new BadRequestException('Neighborhood is not available for delivery');
    const zone = this.store.deliveryZones.find((item) => item.id === neighborhood.deliveryZoneId && item.isActive);
    if (!zone) throw new BadRequestException('Delivery zone is not available');
    if (zone.minOrderValue !== undefined && subtotal < zone.minOrderValue) {
      throw new BadRequestException('Order does not meet minimum value for this region');
    }
    return { zone, neighborhood };
  }

  reserveSlot(slotId?: string) {
    if (!slotId) return undefined;
    const slot = this.store.deliverySlots.find((item) => item.id === slotId && item.isActive);
    if (!slot) throw new BadRequestException('Delivery slot not available');
    if (slot.usedCapacity >= slot.capacity) throw new BadRequestException('Delivery slot is full');
    slot.usedCapacity += 1;
    return slot;
  }
}

