import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthUser } from '../../../common/types/auth.types';
import { AddressesService } from '../application/addresses.service';

@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.addressesService.listByUser(user.userId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      label: string;
      street: string;
      number: string;
      complement?: string;
      neighborhoodId: string;
      reference?: string;
      isDefault?: boolean;
    },
  ) {
    return this.addressesService.create(user.userId, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body()
    body: Partial<{
      label: string;
      street: string;
      number: string;
      complement?: string;
      neighborhoodId: string;
      reference?: string;
      isDefault: boolean;
    }>,
  ) {
    return this.addressesService.update(user.userId, id, body);
  }
}

