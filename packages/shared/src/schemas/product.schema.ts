import { z } from 'zod';

export const productSchema = z.object({
  id: z.string(),
  sku: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  price: z.number(),
  promoPrice: z.number().optional(),
  status: z.enum(['draft', 'active']),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  imageScale: z.number().optional(),
  imagePositionX: z.number().optional(),
  imagePositionY: z.number().optional(),
  optionGroups: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        minSelect: z.number(),
        maxSelect: z.number(),
        isRequired: z.boolean(),
        options: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            priceDelta: z.number(),
            isActive: z.boolean(),
          }),
        ),
      }),
    )
    .optional(),
});
