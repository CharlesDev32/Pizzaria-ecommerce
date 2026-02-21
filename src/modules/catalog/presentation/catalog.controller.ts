import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CatalogService } from '../application/catalog.service';
import { FilesService } from '../../files/application/files.service';

@Controller('products')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService, private readonly filesService: FilesService) {}

  @Get()
  list(@Query() query: Record<string, string>) {
    return this.catalogService.list(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.catalogService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.catalogService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    const uploaded = await this.filesService.uploadProductImage(file);
    return this.catalogService.addImage(id, uploaded);
  }
}
