import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CouponsModule } from '../coupons/coupons.module';
import { DeliveryModule } from '../delivery/delivery.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AddressesModule } from '../addresses/addresses.module';
import { CheckoutService } from './application/checkout.service';
import { CheckoutController } from './presentation/checkout.controller';

@Module({
  imports: [AddressesModule, DeliveryModule, CartModule, CouponsModule, InventoryModule],
  providers: [CheckoutService],
  controllers: [CheckoutController],
  exports: [CheckoutService],
})
export class CheckoutModule {}
