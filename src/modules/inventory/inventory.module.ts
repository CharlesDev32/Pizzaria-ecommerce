import { Module } from '@nestjs/common';
import { InventoryService } from './application/inventory.service';
import { InventoryController } from './presentation/inventory.controller';

@Module({ providers: [InventoryService], controllers: [InventoryController], exports: [InventoryService] })
export class InventoryModule {}
