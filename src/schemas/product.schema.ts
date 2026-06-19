import { z } from "zod";
import { EntityIdSchema, ISODateTimeStringSchema } from "./common.schema";
import { CategoryNameSchema } from "./category.schema";
import { ReviewSchema } from "./review.schema";

export const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;
export const PRODUCT_COLORS = ["Black", "White", "Blue", "Red"] as const;
export const PRODUCT_STATUSES = ["active", "inactive"] as const;

export const SizeSchema = z.enum(PRODUCT_SIZES);
export const ColorSchema = z.enum(PRODUCT_COLORS);
export const ProductStatusSchema = z.enum(PRODUCT_STATUSES);

export const InventorySchema = z.object({
  quantity: z.number(),
  reserved: z.number(),
  available: z.number(),
});

export const VariantSchema = z.object({
  id: EntityIdSchema,
  sku: z.string(),
  color: ColorSchema,
  size: SizeSchema,
  inventory: InventorySchema,
  price: z.number(),
  salePrice: z.number().optional(),
  images: z.array(z.string()),
  isAvailable: z.boolean(),
});

export const ProductMetadataSchema = z.object({
  rating: z.number(),
  reviews: z.array(ReviewSchema),
  popularity: z.number(),
  createdAt: ISODateTimeStringSchema,
});

export const ProductEntitySchema = z.object({
  id: EntityIdSchema,
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  category: CategoryNameSchema,
  brand: z.string(),
  status: ProductStatusSchema,
  variants: z.array(VariantSchema),
  metadata: ProductMetadataSchema,
});

export const ProductSchema = ProductEntitySchema.extend({
  // Legacy UI fields
  name: z.string(),
  price: z.number(),
  size: z.array(SizeSchema),
  color: z.array(ColorSchema),
  rating: z.number(),
  image: z.string(),
  images: z.array(z.string()),
  reviews: z.array(ReviewSchema),
  createdAt: ISODateTimeStringSchema,
  popularity: z.number(),
});

export const CreateProductRequestDtoSchema = ProductEntitySchema.omit({
  id: true,
  metadata: true,
})
  .partial()
  .extend({
    category: CategoryNameSchema,
    name: z.string().optional(),
    price: z.number().optional(),
    size: z.array(SizeSchema).optional(),
    color: z.array(ColorSchema).optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
  });

export const UpdateProductRequestDtoSchema = z.object({
  id: EntityIdSchema,
  data: ProductEntitySchema.omit({ id: true })
    .partial()
    .extend({
      name: z.string().optional(),
      price: z.number().optional(),
      size: z.array(SizeSchema).optional(),
      color: z.array(ColorSchema).optional(),
      image: z.string().optional(),
      images: z.array(z.string()).optional(),
    }),
});
