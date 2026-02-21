import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(3),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  minOrderValue: z.number().optional(),
  usageLimitGlobal: z.number().optional(),
  usageLimitPerUser: z.number().optional(),
});
