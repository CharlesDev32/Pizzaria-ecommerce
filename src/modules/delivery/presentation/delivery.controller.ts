import { Controller, Get, Query } from '@nestjs/common';
import { DeliveryService } from '../application/delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('zones')
  zones() {
    return this.deliveryService.listZones();
  }

  @Get('neighborhoods')
  neighborhoods() {
    return this.deliveryService.listNeighborhoods();
  }

  @Get('slots')
  slots(@Query('date') date?: string) {
    return this.deliveryService.listSlots(date);
  }
}

