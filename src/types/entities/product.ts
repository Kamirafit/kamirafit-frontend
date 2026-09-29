import { z } from "zod";
import {
  PRODUCT_SIZES, PRODUCT_COLORS, PRODUCT_STATUSES,
  SizeSchema, ColorSchema, ProductStatusSchema,
  InventorySchema, VariantSchema, ProductMetadataSchema,
  ProductEntitySchema, ProductSchema
} from "@/schemas/product.schema";
import type { Review } from "./review";

export { PRODUCT_SIZES, PRODUCT_COLORS, PRODUCT_STATUSES };

export type Size = z.infer<typeof SizeSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type Inventory = z.infer<typeof InventorySchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type ProductMetadata = z.infer<typeof ProductMetadataSchema>;
export type ProductEntity = z.infer<typeof ProductEntitySchema>;
export type Product = z.infer<typeof ProductSchema>;

export interface RawProductVariantInput {
  id?: string;
  _id?: string;
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  salePrice?: number;
  offerPrice?: number;
  mrp?: number;
  stock?: number;
  weight?: number;
  gstPercentage?: number;
  hsnCode?: string;
  inventory?: {
    quantity?: number;
    reserved?: number;
    available?: number;
  };
  images?: string[];
  isAvailable?: boolean;
  [key: string]: unknown;
}

export interface RawProductInput {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  category?: string | { id?: string; name?: string };
  categoryName?: string;
  subcategory?: string;
  brand?: string;
  status?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  isFeatured?: boolean;
  costPrice?: number | string;
  price?: number;
  salePrice?: number;
  offerPrice?: number;
  mrp?: number;
  basePrice?: number;
  baseMrp?: number;
  image?: string;
  images?: string[];
  imageColorMap?: Array<{ src?: string; color?: string }> | Record<string, string[] | string>;
  size?: string[];
  sizes?: string[];
  color?: string[];
  colors?: string[];
  variants?: RawProductVariantInput[];
  rating?: number;
  popularity?: number;
  reviews?: Array<{ rating?: number | string; [key: string]: unknown }>;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    rating?: number;
    reviews?: Array<{ rating?: number | string; [key: string]: unknown }>;
    popularity?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
  data?: RawProductInput;
  [key: string]: unknown;
}

export function adaptProduct(raw: RawProductInput | unknown): Product {
  const p = (raw && typeof raw === "object" && "data" in raw && (raw as { data: unknown }).data ? (raw as { data: RawProductInput }).data : raw) as RawProductInput || {};
  const rawVariants = Array.isArray(p.variants) ? p.variants : [];

  const variants = rawVariants.map((v: RawProductVariantInput, index: number) => {
    const available = typeof v.inventory?.available === "number" ? v.inventory.available : (typeof v.stock === "number" ? v.stock : 0);
    const quantity = typeof v.inventory?.quantity === "number" ? v.inventory.quantity : available;
    const reserved = typeof v.inventory?.reserved === "number" ? v.inventory.reserved : 0;

    const vPrice = typeof v.price === "number" ? v.price : (typeof v.offerPrice === "number" ? v.offerPrice : (p.price || p.basePrice || 0));
    const vMrp = typeof v.mrp === "number" ? v.mrp : (p.mrp || p.baseMrp || vPrice);
    const vSalePrice = typeof v.salePrice === "number" ? v.salePrice : (typeof v.offerPrice === "number" ? v.offerPrice : vPrice);
    const vOfferPrice = typeof v.offerPrice === "number" ? v.offerPrice : vPrice;

    return {
      id: v.id || v._id || `v-${index}`,
      sku: v.sku || `SKU-${index}`,
      color: v.color || "Black",
      size: v.size || "M",
      price: vPrice,
      salePrice: vSalePrice,
      offerPrice: vOfferPrice,
      mrp: vMrp,
      stock: available,
      weight: typeof v.weight === "number" ? v.weight : 0.2,
      gstPercentage: typeof v.gstPercentage === "number" ? v.gstPercentage : 5.0,
      hsnCode: v.hsnCode || "61091000",
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
    ...variants.map((v) => v.size),
  ]));

  const colors = Array.from(new Set([
    ...(Array.isArray(p.colors) ? p.colors : []),
    ...(Array.isArray(p.color) ? p.color : []),
    ...variants.map((v) => v.color),
  ]));

  const images = Array.from(new Set([
    ...(Array.isArray(p.images) ? p.images : []),
    ...(p.image ? [p.image] : []),
    ...variants.flatMap((v) => v.images || []),
  ]));

  const rawReviews = Array.isArray(p.reviews) ? p.reviews : (p.metadata?.reviews ?? []);
  const reviews: Review[] = rawReviews.map((r, idx) => ({
    id: String(r.id || `rev-${idx}`),
    productId: String(r.productId || p.id || p._id || ""),
    customerName: String(r.customerName || r.name || "Verified Customer"),
    rating: Number(r.rating || 5),
    comment: String(r.comment || r.content || ""),
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    createdAt: String(r.createdAt || new Date().toISOString()),
    orderId: r.orderId ? String(r.orderId) : undefined,
    title: r.title ? String(r.title) : undefined,
    date: r.date ? String(r.date) : undefined,
  }));
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? Number((reviews.reduce((sum: number, r) => sum + (Number(r.rating) || 0), 0) / reviewCount).toFixed(1))
      : typeof p.rating === "number" && p.rating !== 5
      ? p.rating
      : typeof p.metadata?.rating === "number"
      ? p.metadata.rating
      : 0;
  const popularity = typeof p.popularity === "number" ? p.popularity : (p.metadata?.popularity ?? 0);
  const createdAt = p.createdAt || p.metadata?.createdAt || new Date().toISOString();
  const updatedAt = p.updatedAt || p.metadata?.updatedAt || undefined;

  const imageColorMap: Record<string, string> = {};
  if (Array.isArray(p.imageColorMap)) {
    p.imageColorMap.forEach((item: { src?: string; color?: string }) => {
      if (item && item.src && item.color) imageColorMap[item.src] = item.color;
    });
  } else if (p.imageColorMap && typeof p.imageColorMap === "object") {
    for (const [k, v] of Object.entries(p.imageColorMap)) {
      if (Array.isArray(v)) {
        v.forEach((url: unknown) => {
          if (typeof url === "string") imageColorMap[url] = k;
        });
      } else if (typeof v === "string") {
        imageColorMap[k] = v;
      }
    }
  }

  const resolvedCatName = p.categoryName || (typeof p.category === "string" ? p.category : (p.category && typeof p.category === "object" ? p.category.name : undefined)) || "T-Shirts";
  const resolvedCatId = p.categoryId || (typeof p.category === "object" && p.category && "id" in p.category ? (p.category as { id?: string }).id : undefined);

  return {
    id: p.id || p._id || "",
    _id: p._id || p.id || "",
    name: p.name || p.title || "Untitled Product",
    title: p.title || p.name || "Untitled Product",
    slug: p.slug || "",
    description: p.description || "",
    categoryId: resolvedCatId,
    category: resolvedCatName as Product["category"],
    categoryName: resolvedCatName,
    subcategory: p.subcategory || "",
    brand: p.brand || "KamiraFit",
    status: (p.status || (p.isActive ? "active" : "inactive")) as Product["status"],
    isActive: typeof p.isActive === "boolean" ? p.isActive : p.status === "active",
    isAvailable: typeof p.isAvailable === "boolean" ? p.isAvailable : true,
    isFeatured: typeof p.isFeatured === "boolean" ? p.isFeatured : false,
    costPrice: typeof p.costPrice === "number" ? p.costPrice : (p.costPrice ? Number(p.costPrice) : 0),
    price: typeof p.price === "number" ? p.price : (variants[0]?.price ?? (p.basePrice || 0)),
    salePrice: typeof p.salePrice === "number" ? p.salePrice : (typeof p.offerPrice === "number" ? p.offerPrice : (variants[0]?.salePrice ?? p.price ?? 0)),
    offerPrice: typeof p.offerPrice === "number" ? p.offerPrice : (variants[0]?.offerPrice ?? p.price ?? 0),
    mrp: typeof p.mrp === "number" ? p.mrp : (p.baseMrp || p.salePrice || 0),
    basePrice: typeof p.basePrice === "number" ? p.basePrice : (p.price || 0),
    baseMrp: typeof p.baseMrp === "number" ? p.baseMrp : (p.mrp || 0),
    image: p.image || images[0] || "",
    images: images.length ? images : [p.image || ""].filter(Boolean),
    imageColorMap,
    size: sizes,
    sizes: sizes,
    color: colors,
    colors: colors,
    variants: variants,
    rating,
    reviews,
    createdAt,
    updatedAt,
    popularity,
    metadata: {
      rating,
      reviews,
      popularity,
      createdAt,
    },
  };
}
