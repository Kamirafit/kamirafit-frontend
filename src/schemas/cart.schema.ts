import { z } from "zod";
import { EntityIdSchema, ISODateTimeStringSchema } from "./common.schema";
import { SizeSchema, ColorSchema } from "./product.schema";

export const CartItemSchema = z.object({
  id: EntityIdSchema,
  variantId: z.string().optional(),
  size: SizeSchema.optional(),
  color: ColorSchema.optional(),
  quantity: z.number().int().positive(),
});

export const CartSchema = z.object({
  id: EntityIdSchema.optional(),
  userId: EntityIdSchema.optional(),
  items: z.array(CartItemSchema),
  updatedAt: ISODateTimeStringSchema.optional(),
});
