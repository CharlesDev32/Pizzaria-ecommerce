import { Module } from '@nestjs/common';
import { AuditLogService } from './application/audit-log.service';
import { AuditLogController } from './presentation/audit-log.controller';

@Module({ providers: [AuditLogService], controllers: [AuditLogController], exports: [AuditLogService] })
export class AuditLogModule {}
