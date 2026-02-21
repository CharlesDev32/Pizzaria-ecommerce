import { Module } from '@nestjs/common';
import { OrdersService } from './application/orders.service';
import { OrdersController } from './presentation/orders.controller';

@Module({ providers: [OrdersService], controllers: [OrdersController], exports: [OrdersService] })
export class OrdersModule {}
