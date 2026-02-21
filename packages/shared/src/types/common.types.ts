export interface ApiListResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  usageLimitGlobal?: number;
  usageLimitPerUser?: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
}
