import { BadRequestException, Injectable } from '@nestjs/common';
import { QueueService } from '../../../common/queue/queue.service';
import { StoreService } from '../../../shared/store/store.service';
import { AddressesService } from '../../addresses/application/addresses.service';
import { CartService } from '../../cart/application/cart.service';
import { CouponsService } from '../../coupons/application/coupons.service';
import { DeliveryService } from '../../delivery/application/delivery.service';
import { InventoryService } from '../../inventory/application/inventory.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly store: StoreService,
    private readonly addressesService: AddressesService,
    private readonly deliveryService: DeliveryService,
    private readonly cartService: CartService,
    private readonly couponsService: CouponsService,
    private readonly inventoryService: InventoryService,
    private readonly queue: QueueService,
  ) {}

  async checkout(
    userId: string,
    idempotencyKey: string,
    input: {
      addressId: string;
      scheduledAt?: string;
      slotId?: string;
      paymentMethod: 'cash_on_delivery' | 'card_on_delivery';
      changeFor?: number;
      notes?: string;
    },
  ) {
    const existing = this.store.orders.find((o) => o.userId === userId && o.idempotencyKey === idempotencyKey);
    if (existing) return existing;

    const cart = this.cartService.getCart(userId);
    if (cart.items.length === 0) throw new BadRequestException('Cart is empty');

    cart.items.forEach((item) => this.inventoryService.ensureAvailability(item.productId, item.quantity));

    let discountTotal = 0;
    let couponCode: string | undefined;
    if (cart.couponCode) {
      const coupon = this.couponsService.validateForCart(cart.couponCode, userId, cart.subtotal);
      discountTotal = this.couponsService.calculateDiscount(coupon, cart.subtotal);
      couponCode = coupon.code;
      coupon.usedGlobal += 1;
    }

    const subtotal = cart.subtotal;
    const address = this.addressesService.byIdForUser(userId, input.addressId);
    const { zone, neighborhood } = this.deliveryService.resolveDeliveryForNeighborhood(address.neighborhoodId, subtotal);
    const slot = this.deliveryService.reserveSlot(input.slotId);
    const deliveryFee = zone.fee;
    const grandTotal = Math.max(0, subtotal - discountTotal + deliveryFee);

    const order = {
      id: this.store.id(),
      userId,
      orderType: 'delivery' as const,
      status: 'received' as const,
      subtotal,
      discountTotal,
      deliveryFee,
      grandTotal,
      couponCode,
      idempotencyKey,
      paymentMethod: input.paymentMethod,
      changeFor: input.changeFor,
      notes: input.notes,
      scheduledAt: input.scheduledAt,
      slotId: slot?.id ?? input.slotId,
      addressSnapshot: {
        label: address.label,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhoodName: neighborhood.name,
        zoneName: zone.name,
      },
      items: cart.items.map((i) => {
        const product = this.store.products.find((p) => p.id === i.productId);
        const optionGroups = product?.optionGroups ?? [];
        const options = (i.selectedOptions ?? []).map((selected: { groupId: string; optionId: string }) => {
          const group = optionGroups.find((item) => item.id === selected.groupId);
          const option = group?.options.find((item) => item.id === selected.optionId);
          return {
            groupId: selected.groupId,
            groupName: group?.name ?? 'Grupo',
            optionId: selected.optionId,
            optionName: option?.name ?? 'Opcao',
            priceDelta: option?.priceDelta ?? 0,
          };
        });
        return {
          id: this.store.id(),
          productId: i.productId,
          titleSnapshot: product?.title ?? 'Unknown',
          unitPrice: i.unitPriceSnapshot,
          quantity: i.quantity,
          lineTotal: i.quantity * i.unitPriceSnapshot,
          options,
        };
      }),
      timeline: [{ id: this.store.id(), toStatus: 'received' as const, createdAt: this.store.now() }],
    };

    this.store.orders.push(order);

    order.items.forEach((item) => {
      this.store.movements.push({
        id: this.store.id(),
        productId: item.productId,
        type: 'OUT',
        quantity: item.quantity,
        reason: `checkout:${order.id}`,
        createdAt: this.store.now(),
      });
    });

    this.cartService.clear(userId);
    await this.queue.enqueue('order-confirmation', { orderId: order.id, userId });
    return order;
  }
}
