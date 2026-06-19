import { z } from "zod";
import {
  CategorySchema, CategoryNameSchema, CategorySlugSchema,
  CATEGORY_NAMES, CATEGORY_SLUGS
} from "@/schemas/category.schema";

export { CATEGORY_NAMES, CATEGORY_SLUGS };
export type CategoryName = z.infer<typeof CategoryNameSchema>;
export type CategorySlug = z.infer<typeof CategorySlugSchema>;
export type Category = z.infer<typeof CategorySchema>;
