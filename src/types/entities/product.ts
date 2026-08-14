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

/* eslint-disable @typescript-eslint/no-explicit-any */
export function adaptProduct(raw: any): Product {
  const p = raw?.data || raw || {};
  const rawVariants = Array.isArray(p.variants) ? p.variants : [];

  const variants = rawVariants.map((v: any, index: number) => {
    const available = typeof v.inventory?.available === "number" ? v.inventory.available : (typeof v.stock === "number" ? v.stock : 0);
    const quantity = typeof v.inventory?.quantity === "number" ? v.inventory.quantity : available;
    const reserved = typeof v.inventory?.reserved === "number" ? v.inventory.reserved : 0;

    return {
      id: v.id || v._id || `v-${index}`,
      sku: v.sku || `SKU-${index}`,
      color: v.color || "Black",
      size: v.size || "M",
      price: typeof v.price === "number" ? v.price : (p.price || 0),
      salePrice: typeof v.salePrice === "number" ? v.salePrice : (p.mrp || p.salePrice || 0),
      mrp: typeof v.mrp === "number" ? v.mrp : (p.mrp || 0),
      stock: available,
      inventory: {
        quantity,
        reserved,
        available,
      },
      images: Array.isArray(v.images) ? v.images : (p.images || []),
      isAvailable: typeof v.isAvailable === "boolean" ? v.isAvailable : true,
    };
  });

  const sizes = Array.from(new Set([
    ...(Array.isArray(p.sizes) ? p.sizes : []),
    ...(Array.isArray(p.size) ? p.size : []),
    ...variants.map((v: any) => v.size),
  ]));

  const colors = Array.from(new Set([
    ...(Array.isArray(p.colors) ? p.colors : []),
    ...(Array.isArray(p.color) ? p.color : []),
    ...variants.map((v: any) => v.color),
  ]));

  const images = Array.from(new Set([
    ...(Array.isArray(p.images) ? p.images : []),
    ...(p.image ? [p.image] : []),
    ...variants.flatMap((v: any) => v.images || []),
  ]));

  const rating = typeof p.rating === "number" ? p.rating : (p.metadata?.rating ?? 5);
  const reviews = Array.isArray(p.reviews) ? p.reviews : (p.metadata?.reviews ?? []);
  const popularity = typeof p.popularity === "number" ? p.popularity : (p.metadata?.popularity ?? 0);
  const createdAt = p.createdAt || p.metadata?.createdAt || new Date().toISOString();

  return {
    id: p.id || p._id || "",
    _id: p._id || p.id || "",
    name: p.name || p.title || "Untitled Product",
    title: p.title || p.name || "Untitled Product",
    slug: p.slug || "",
    description: p.description || "",
    category: p.category || p.categoryName || "T-Shirts",
    categoryName: p.categoryName || p.category || "T-Shirts",
    subcategory: p.subcategory || "",
    brand: p.brand || "KamiraFit",
    status: p.status || (p.isActive ? "active" : "inactive"),
    isActive: typeof p.isActive === "boolean" ? p.isActive : p.status === "active",
    isAvailable: typeof p.isAvailable === "boolean" ? p.isAvailable : true,
    isFeatured: typeof p.isFeatured === "boolean" ? p.isFeatured : false,
    costPrice: typeof p.costPrice === "number" ? p.costPrice : 0,
    price: typeof p.price === "number" ? p.price : (variants[0]?.price ?? 0),
    salePrice: typeof p.salePrice === "number" ? p.salePrice : (p.mrp || 0),
    mrp: typeof p.mrp === "number" ? p.mrp : (p.salePrice || 0),
    basePrice: typeof p.basePrice === "number" ? p.basePrice : (p.price || 0),
    baseMrp: typeof p.baseMrp === "number" ? p.baseMrp : (p.mrp || 0),
    image: p.image || images[0] || "",
    images: images.length ? images : [p.image || ""].filter(Boolean),
    size: sizes,
    sizes: sizes,
    color: colors,
    colors: colors,
    variants: variants,
    rating,
    reviews,
    createdAt,
    popularity,
    metadata: {
      rating,
      reviews,
      popularity,
      createdAt,
    },
  };
}
