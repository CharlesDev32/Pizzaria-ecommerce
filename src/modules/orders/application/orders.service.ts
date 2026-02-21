import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';
import { OrderStatus } from '../../../shared/store/store.service';

@Injectable()
export class OrdersService {
  constructor(private readonly store: StoreService) {}

  byUser(userId: string) {
    return this.store.orders.filter((o) => o.userId === userId);
  }

  all() {
    return this.store.orders;
  }

  byId(orderId: string, userId?: string) {
    const order = this.store.orders.find((o) => o.id === orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.userId !== userId) throw new NotFoundException('Order not found');
    return order;
  }

  timeline(orderId: string, userId?: string) {
    return this.byId(orderId, userId).timeline;
  }

  updateStatus(orderId: string, status: OrderStatus) {
    const order = this.byId(orderId);
    const fromStatus = order.status;
    if (!this.canTransition(fromStatus, status)) {
      throw new BadRequestException(`Invalid status transition: ${fromStatus} -> ${status}`);
    }
    order.status = status;
    order.timeline.push({ id: this.store.id(), fromStatus, toStatus: status, createdAt: this.store.now() });
    return order;
  }

  private canTransition(from: OrderStatus, to: OrderStatus) {
    if (from === to) return true;
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      received: ['confirmed', 'canceled'],
      confirmed: ['preparing', 'canceled'],
      preparing: ['ready', 'canceled'],
      ready: ['out_for_delivery', 'canceled'],
      out_for_delivery: ['delivered', 'canceled'],
      delivered: [],
      canceled: [],
    };
    return transitions[from].includes(to);
  }
}
