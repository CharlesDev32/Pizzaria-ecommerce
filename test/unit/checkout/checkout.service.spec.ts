import { QueueService } from '../../../src/common/queue/queue.service';
import { StoreService } from '../../../src/shared/store/store.service';
import { CartService } from '../../../src/modules/cart/application/cart.service';
import { CouponsService } from '../../../src/modules/coupons/application/coupons.service';
import { InventoryService } from '../../../src/modules/inventory/application/inventory.service';
import { CheckoutService } from '../../../src/modules/checkout/application/checkout.service';
import { AddressesService } from '../../../src/modules/addresses/application/addresses.service';
import { DeliveryService } from '../../../src/modules/delivery/application/delivery.service';

describe('CheckoutService', () => {
  it('should compute totals with coupon', async () => {
    const store = new StoreService();
    const cart = new CartService(store);
    const coupons = new CouponsService(store);
    const inventory = new InventoryService(store);
    const addresses = new AddressesService(store);
    const delivery = new DeliveryService(store);
    const checkout = new CheckoutService(store, addresses, delivery, cart, coupons, inventory, new QueueService());

    store.products.push({
      id: 'p1', sku: 'SKU1', title: 'Pizza', slug: 'pizza', price: 50, status: 'active', tags: [], images: [],
    });

    inventory.move({ productId: 'p1', type: 'IN', quantity: 10 });
    coupons.create({ code: 'OFF10', type: 'percentage', value: 10 });
    store.deliveryZones.push({ id: 'z1', name: 'Centro', fee: 5, minOrderValue: 10, isActive: true });
    store.neighborhoods.push({ id: 'n1', name: 'Centro', deliveryZoneId: 'z1', isActive: true });
    store.customerAddresses.push({
      id: 'a1',
      userId: 'u1',
      label: 'Casa',
      street: 'Rua A',
      number: '100',
      neighborhoodId: 'n1',
      isDefault: true,
    });

    cart.addItem('u1', 'p1', 2);
    cart.applyCoupon('u1', 'OFF10');

    const order = await checkout.checkout('u1', 'idem-1', { addressId: 'a1', paymentMethod: 'cash_on_delivery' });
    expect(order.subtotal).toBe(100);
    expect(order.discountTotal).toBe(10);
    expect(order.grandTotal).toBe(95);
  });
});
