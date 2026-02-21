import { Module } from '@nestjs/common';
import { SettingsService } from './application/settings.service';
import { SettingsController } from './presentation/settings.controller';

@Module({
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
