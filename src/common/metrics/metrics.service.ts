import { Injectable } from '@nestjs/common';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly httpCounter: Counter<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });
    this.httpCounter = new Counter({
      name: 'pizza_api_http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['route', 'method', 'status'],
      registers: [this.registry],
    });
  }

  observe(route: string, method: string, status: number): void {
    this.httpCounter.inc({ route, method, status: String(status) });
  }

  async metrics(): Promise<string> {
    return this.registry.metrics();
  }
}
