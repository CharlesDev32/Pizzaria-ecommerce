import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from '../../../common/metrics/metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async metrics() {
    return this.metricsService.metrics();
  }
}
