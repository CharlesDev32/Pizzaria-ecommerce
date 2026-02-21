import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { DeliveryService } from '../application/delivery.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/delivery')
export class AdminDeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('zones')
  createZone(@Body() body: { name: string; fee: number; minOrderValue?: number; isActive?: boolean }) {
    return this.deliveryService.createZone(body);
  }

  @Post('neighborhoods')
  createNeighborhood(@Body() body: { name: string; deliveryZoneId: string; isActive?: boolean }) {
    return this.deliveryService.createNeighborhood(body);
  }

  @Post('slots')
  createSlot(@Body() body: { startAt: string; endAt: string; capacity: number; isActive?: boolean }) {
    return this.deliveryService.createSlot(body);
  }
}

