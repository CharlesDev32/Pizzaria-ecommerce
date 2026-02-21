import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../../common/types/auth.types';
import { CheckoutService } from '../application/checkout.service';

@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  checkout(
    @CurrentUser() user: AuthUser,
    @Headers('idempotency-key') idem: string,
    @Body()
    body: {
      addressId: string;
      scheduledAt?: string;
      slotId?: string;
      paymentMethod: 'cash_on_delivery' | 'card_on_delivery';
      changeFor?: number;
      notes?: string;
    },
  ) {
    return this.checkoutService.checkout(user.userId, idem || 'missing-idempotency-key', body);
  }
}
