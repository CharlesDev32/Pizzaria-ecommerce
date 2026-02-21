import { Module } from '@nestjs/common';
import { AddressesService } from './application/addresses.service';
import { AddressesController } from './presentation/addresses.controller';

@Module({
  providers: [AddressesService],
  controllers: [AddressesController],
  exports: [AddressesService],
})
export class AddressesModule {}

