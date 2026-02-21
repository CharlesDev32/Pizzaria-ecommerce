import { Injectable } from '@nestjs/common';
import { StoreService } from '../../../shared/store/store.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly store: StoreService) {}

  log(input: { actorUserId: string; action: string; resourceType: string; resourceId: string }) {
    const record = { id: this.store.id(), ...input, createdAt: this.store.now() };
    this.store.audit.push(record);
    return record;
  }

  list(query: { action?: string; page?: string; limit?: string }) {
    const page = Number(query.page ?? 1);
    const limit = Math.min(Number(query.limit ?? 20), 100);
    let data = [...this.store.audit];
    if (query.action) data = data.filter((a) => a.action === query.action);
    return {
      data: data.slice((page - 1) * limit, page * limit),
      page,
      limit,
      total: data.length,
    };
  }
}
