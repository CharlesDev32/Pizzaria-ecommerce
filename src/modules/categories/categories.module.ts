import { Module } from '@nestjs/common';
import { CategoriesService } from './application/categories.service';
import { CategoriesController } from './presentation/categories.controller';

@Module({
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
