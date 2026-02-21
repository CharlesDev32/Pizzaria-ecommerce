import { Module } from '@nestjs/common';
import { CouponsService } from './application/coupons.service';
import { CouponsController } from './presentation/coupons.controller';

@Module({ providers: [CouponsService], controllers: [CouponsController], exports: [CouponsService] })
export class CouponsModule {}
