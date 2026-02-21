import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async upload(buffer: Buffer, objectKey: string, mimeType: string): Promise<{ key: string; url: string; size: number; mimeType: string }> {
    return {
      key: objectKey,
      url: `${process.env.S3_ENDPOINT ?? 'http://localhost:9000'}/${process.env.S3_BUCKET ?? 'products'}/${objectKey}`,
      size: buffer.length,
      mimeType,
    };
  }
}
