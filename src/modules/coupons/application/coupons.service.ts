import { BadRequestException, Injectable } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class CouponsService {
  constructor(private readonly store: StoreService) {}

  create(input: { code: string; type: 'percentage' | 'fixed'; value: number; minOrderValue?: number; expiresAt?: string; usageLimitGlobal?: number; usageLimitPerUser?: number }) {
    const coupon = {
      id: this.store.id(),
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      minOrderValue: input.minOrderValue,
      expiresAt: input.expiresAt,
      usageLimitGlobal: input.usageLimitGlobal,
      usageLimitPerUser: input.usageLimitPerUser,
      usedGlobal: 0,
    };
    this.store.coupons.push(coupon);
    return coupon;
  }

  list() {
    return this.store.coupons;
  }

  validateForCart(code: string, userId: string, subtotal: number) {
    const coupon = this.store.coupons.find((c) => c.code === code.toUpperCase());
    if (!coupon) throw new BadRequestException('Coupon not found');
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) throw new BadRequestException('Coupon expired');
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) throw new BadRequestException('Minimum order value not reached');
    if (coupon.usageLimitGlobal && coupon.usedGlobal >= coupon.usageLimitGlobal) throw new BadRequestException('Coupon usage limit reached');

    const usedByUser = this.store.orders.filter((o) => o.userId === userId && o.couponCode === coupon.code).length;
    if (coupon.usageLimitPerUser && usedByUser >= coupon.usageLimitPerUser) throw new BadRequestException('Coupon user limit reached');

    return coupon;
  }

  calculateDiscount(coupon: { type: 'percentage' | 'fixed'; value: number }, subtotal: number): number {
    if (coupon.type === 'fixed') return Math.min(subtotal, coupon.value);
    return Number((subtotal * (coupon.value / 100)).toFixed(2));
  }
}
