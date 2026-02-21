import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../../common/types/auth.types';
import { CartService } from '../application/cart.service';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthUser) {
    return this.cartService.getCart(user.userId);
  }

  @Post('items')
  add(
    @CurrentUser() user: AuthUser,
    @Body() body: { productId: string; quantity: number; selectedOptions?: Array<{ groupId: string; optionId: string }> },
  ) {
    return this.cartService.addItem(user.userId, body.productId, body.quantity, body.selectedOptions ?? []);
  }

  @Patch('items/:itemId')
  update(@CurrentUser() user: AuthUser, @Param('itemId') itemId: string, @Body() body: { quantity: number }) {
    return this.cartService.updateItem(user.userId, itemId, body.quantity);
  }

  @Delete('items/:itemId')
  remove(@CurrentUser() user: AuthUser, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user.userId, itemId);
  }

  @Post('apply-coupon')
  applyCoupon(@CurrentUser() user: AuthUser, @Body() body: { code: string }) {
    return this.cartService.applyCoupon(user.userId, body.code);
  }
}
