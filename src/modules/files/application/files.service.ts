import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '../../../common/storage/storage.service';

@Injectable()
export class FilesService {
  constructor(private readonly storage: StorageService) {}

  async uploadProductImage(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const maxSize = Number(process.env.MAX_UPLOAD_SIZE_BYTES ?? 5 * 1024 * 1024);
    const allowed = (process.env.ALLOWED_UPLOAD_MIME ?? 'image/jpeg,image/png,image/webp').split(',');

    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Invalid file type');
    if (file.size > maxSize) throw new BadRequestException('File too large');

    const objectKey = `products/${Date.now()}-${file.originalname}`;
    const uploaded = await this.storage.upload(file.buffer, objectKey, file.mimetype);

    return {
      url: uploaded.url,
      objectKey: uploaded.key,
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.size,
    };
  }
}
