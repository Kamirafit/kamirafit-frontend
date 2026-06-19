import { z } from "zod";
import { EntityIdSchema, ISODateTimeStringSchema } from "./common.schema";

export const WishlistSchema = z.object({
  id: EntityIdSchema.optional(),
  userId: EntityIdSchema.optional(),
  productIds: z.array(EntityIdSchema),
  updatedAt: ISODateTimeStringSchema.optional(),
});
