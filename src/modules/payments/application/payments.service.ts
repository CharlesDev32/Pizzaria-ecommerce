import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { QueueService } from '../../../common/queue/queue.service';
import { StoreService } from '../../../shared/store/store.service';
import { OrdersService } from '../../orders/application/orders.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly store: StoreService,
    private readonly ordersService: OrdersService,
    private readonly queue: QueueService,
  ) {}

  createIntent(orderId: string) {
    const order = this.ordersService.byId(orderId);
    const intent = {
      id: this.store.id(),
      orderId,
      provider: 'FAKE' as const,
      status: 'REQUIRES_ACTION' as const,
      amount: order.grandTotal,
    };
    this.store.paymentIntents.push(intent);
    return intent;
  }

  getIntent(intentId: string) {
    const intent = this.store.paymentIntents.find((i) => i.id === intentId);
    if (!intent) throw new NotFoundException('Payment intent not found');
    return intent;
  }

  async simulate(intentId: string, success: boolean) {
    const intent = this.getIntent(intentId);
    intent.status = success ? 'SUCCEEDED' : 'FAILED';

    if (success) {
      const order = this.ordersService.updateStatus(intent.orderId, 'confirmed');
      await this.queue.enqueue('order-status-update', { orderId: order.id, status: 'confirmed' });
    }

    return intent;
  }

  async fakeWebhook(signature: string, payload: { intentId: string; event: 'payment.succeeded' | 'payment.failed' }) {
    const secret = process.env.WEBHOOK_FAKE_SECRET ?? 'fake_webhook_secret';
    if (signature !== secret) throw new UnauthorizedException('Invalid signature');
    await this.simulate(payload.intentId, payload.event === 'payment.succeeded');
    return { received: true };
  }
}
