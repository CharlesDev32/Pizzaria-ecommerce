import { z } from 'zod';

export const orderSchema = z.object({
  id: z.string(),
  orderType: z.literal('delivery'),
  status: z.enum(['received', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'canceled']),
  subtotal: z.number(),
  discountTotal: z.number(),
  deliveryFee: z.number(),
  grandTotal: z.number(),
  paymentMethod: z.enum(['cash_on_delivery', 'card_on_delivery']),
  changeFor: z.number().optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().optional(),
  slotId: z.string().optional(),
  addressSnapshot: z.object({
    label: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhoodName: z.string(),
    zoneName: z.string(),
  }),
});
