import { Module } from '@nestjs/common';
import { FilesModule } from '../files/files.module';
import { CatalogService } from './application/catalog.service';
import { CatalogController } from './presentation/catalog.controller';

@Module({
  imports: [FilesModule],
  providers: [CatalogService],
  controllers: [CatalogController],
  exports: [CatalogService],
})
export class CatalogModule {}
