import { Module } from '@nestjs/common';
import { CartService } from './application/cart.service';
import { CartController } from './presentation/cart.controller';

@Module({ providers: [CartService], controllers: [CartController], exports: [CartService] })
export class CartModule {}
