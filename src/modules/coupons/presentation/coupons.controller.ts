import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CouponsService } from '../application/coupons.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.couponsService.create(body);
  }

  @Roles('ADMIN')
  @Get()
  list() {
    return this.couponsService.list();
  }
}
