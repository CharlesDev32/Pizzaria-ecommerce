import { Global, Module } from '@nestjs/common';
import { MetricsService } from './metrics/metrics.service';
import { QueueService } from './queue/queue.service';
import { BruteForceService } from './security/brute-force.service';
import { StorageService } from './storage/storage.service';
import { StoreService } from '../shared/store/store.service';

@Global()
@Module({
  providers: [StoreService, QueueService, BruteForceService, StorageService, MetricsService],
  exports: [StoreService, QueueService, BruteForceService, StorageService, MetricsService],
})
export class CoreModule {}
