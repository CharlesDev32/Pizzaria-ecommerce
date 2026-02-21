import { z } from 'zod';

export const inventoryMovementSchema = z.object({
  productId: z.string(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});
