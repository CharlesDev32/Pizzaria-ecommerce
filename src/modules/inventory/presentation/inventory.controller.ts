import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { InventoryService } from '../application/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('movements')
  move(@Body() body: { productId: string; type: 'IN' | 'OUT' | 'ADJUSTMENT'; quantity: number; reason?: string }) {
    return this.inventoryService.move(body);
  }

  @Get('movements')
  list() {
    return this.inventoryService.list();
  }

  @Get('products/:productId/stock')
  stock(@Param('productId') productId: string) {
    return this.inventoryService.stock(productId);
  }
}
