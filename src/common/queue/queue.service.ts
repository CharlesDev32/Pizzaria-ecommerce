import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  async enqueue(name: string, payload: Record<string, unknown>): Promise<void> {
    this.logger.log(`Queue job ${name}`, JSON.stringify(payload));
  }
}
