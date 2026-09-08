import { z } from "zod";
import { EntityIdSchema, ISODateTimeStringSchema } from "./common.schema";
import { CategoryNameSchema } from "./category.schema";
import { ReviewSchema } from "./review.schema";

export const PRODUCT_SIZES = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "Free Size"
] as const;
export const PRODUCT_COLORS = [
  "Black", "White", "Blue", "Red", "Green", "Yellow", "Pink", "Beige", "Navy", "Maroon", "Grey"
] as const;
export const PRODUCT_STATUSES = ["active", "inactive"] as const;

export const SizeSchema = z.string();
export const ColorSchema = z.string();
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
  mrp: z.number().optional(),
  stock: z.number().optional(),
  images: z.array(z.string()).optional(),
  isAvailable: z.boolean().optional(),
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
  _id: z.string().optional(),
  name: z.string(),
  categoryName: z.string().optional(),
  subcategory: z.string().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  costPrice: z.number().optional(),
  price: z.number(),
  salePrice: z.number().optional(),
  mrp: z.number().optional(),
  basePrice: z.number().optional(),
  baseMrp: z.number().optional(),
  image: z.string(),
  images: z.array(z.string()),
  size: z.array(SizeSchema),
  sizes: z.array(SizeSchema).optional(),
  color: z.array(ColorSchema),
  colors: z.array(ColorSchema).optional(),
  rating: z.number(),
  reviews: z.array(ReviewSchema),
  createdAt: ISODateTimeStringSchema,
  updatedAt: ISODateTimeStringSchema.optional(),
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
