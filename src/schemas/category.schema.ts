import { z } from "zod";
import { EntityIdSchema } from "./common.schema";

export const CATEGORY_NAMES = [
  "Kurti",
  "Co-ords Sets",
  "Dresses",
  "T-Shirts",
  "Oversized T-Shirts",
  "Hoodies",
] as const;

export const CATEGORY_SLUGS = [
  "kurti",
  "co-ords-sets",
  "dresses",
  "t-shirts",
  "oversized-t-shirts",
  "hoodies",
] as const;

export const CategoryNameSchema = z.enum(CATEGORY_NAMES);
export const CategorySlugSchema = z.enum(CATEGORY_SLUGS);

export const CategorySchema = z.object({
  id: EntityIdSchema,
  name: CategoryNameSchema,
  slug: CategorySlugSchema,
  image: z.string().optional(),
  description: z.string().optional(),
});

export const AdminCategorySchema = z.object({
  id: EntityIdSchema,
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  subcategories: z.array(z.string()),
  parentId: z.string().nullable().optional(),
});
