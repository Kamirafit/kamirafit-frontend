import { z } from "zod";
import {
  PRODUCT_SIZES, PRODUCT_COLORS, PRODUCT_STATUSES,
  SizeSchema, ColorSchema, ProductStatusSchema,
  InventorySchema, VariantSchema, ProductMetadataSchema,
  ProductEntitySchema, ProductSchema
} from "@/schemas/product.schema";

export { PRODUCT_SIZES, PRODUCT_COLORS, PRODUCT_STATUSES };

export type Size = z.infer<typeof SizeSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type Inventory = z.infer<typeof InventorySchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type ProductMetadata = z.infer<typeof ProductMetadataSchema>;
export type ProductEntity = z.infer<typeof ProductEntitySchema>;
export type Product = z.infer<typeof ProductSchema>;

export function adaptProduct(entity: ProductEntity): Product {
  const primaryVariant = entity.variants[0];
  const allImages = Array.from(new Set(entity.variants.flatMap((v) => v.images)));
  const allSizes = Array.from(new Set(entity.variants.map((v) => v.size)));
  const allColors = Array.from(new Set(entity.variants.map((v) => v.color)));

  return {
    ...entity,
    name: entity.title,
    price: primaryVariant?.price ?? 0,
    size: allSizes,
    color: allColors,
    rating: entity.metadata.rating,
    image: primaryVariant?.images[0] || "",
    images: allImages,
    reviews: entity.metadata.reviews,
    createdAt: entity.metadata.createdAt,
    popularity: entity.metadata.popularity,
  };
}
