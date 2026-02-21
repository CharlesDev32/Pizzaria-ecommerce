import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AuthUser } from '../../../common/types/auth.types';
import { OrdersService } from '../application/orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('me')
  myOrders(@CurrentUser() user: AuthUser) {
    return this.ordersService.byUser(user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  allOrders() {
    return this.ordersService.all();
  }

  @Get(':id')
  order(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ordersService.byId(id, user.userId);
  }

  @Get(':id/timeline')
  timeline(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.ordersService.timeline(id, user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: any }) {
    return this.ordersService.updateStatus(id, body.status);
  }
}
