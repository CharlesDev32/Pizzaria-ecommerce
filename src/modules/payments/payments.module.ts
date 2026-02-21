import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsService } from './application/payments.service';
import { PaymentsController } from './presentation/payments.controller';

@Module({ imports: [OrdersModule], providers: [PaymentsService], controllers: [PaymentsController], exports: [PaymentsService] })
export class PaymentsModule {}
