import { EntityId, ISODateTimeString } from "./common";
import { CategoryName } from "./category";
import { Review } from "./review";

export const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof PRODUCT_SIZES)[number];

export const PRODUCT_COLORS = ["Black", "White", "Blue", "Red"] as const;
export type Color = (typeof PRODUCT_COLORS)[number];

export const PRODUCT_STATUSES = ["active", "inactive"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Inventory {
  quantity: number;
  reserved: number;
  available: number;
}

export interface Variant {
  id: EntityId;
  sku: string;
  color: Color;
  size: Size;
  inventory: Inventory;
  price: number;
  salePrice?: number;
  images: string[];
  isAvailable: boolean;
}

export interface ProductMetadata {
  rating: number;
  reviews: Review[];
  popularity: number;
  createdAt: ISODateTimeString;
}

export interface ProductEntity {
  id: EntityId;
  title: string;
  slug: string;
  description: string;
  category: CategoryName;
  brand: string;
  status: ProductStatus;
  variants: Variant[];
  metadata: ProductMetadata;
}

export interface Product extends ProductEntity {
  name: string;
  price: number;
  size: Size[];
  color: Color[];
  rating: number;
  image: string;
  images: string[];
  reviews: Review[];
  createdAt: ISODateTimeString;
  popularity: number;
}

export function adaptProduct(entity: ProductEntity): Product {
  const primaryVariant = entity.variants[0];
  const allImages = Array.from(new Set(entity.variants.flatMap(v => v.images)));
  const allSizes = Array.from(new Set(entity.variants.map(v => v.size)));
  const allColors = Array.from(new Set(entity.variants.map(v => v.color)));

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
