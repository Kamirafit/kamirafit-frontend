import { z } from "zod";
import { EntityIdSchema, ISODateStringSchema, ISODateTimeStringSchema } from "./common.schema";

export const ReviewSchema = z.object({
  id: EntityIdSchema,
  productId: EntityIdSchema,
  orderId: EntityIdSchema.optional(),
  customerName: z.string(),
  rating: z.number(),
  title: z.string().optional(),
  comment: z.string(),
  images: z.array(z.string()),
  createdAt: ISODateTimeStringSchema,
  date: ISODateStringSchema.optional(),
});
