import { Module } from '@nestjs/common';
import { DeliveryService } from './application/delivery.service';
import { DeliveryController } from './presentation/delivery.controller';
import { AdminDeliveryController } from './presentation/admin-delivery.controller';

@Module({
  providers: [DeliveryService],
  controllers: [DeliveryController, AdminDeliveryController],
  exports: [DeliveryService],
})
export class DeliveryModule {}

