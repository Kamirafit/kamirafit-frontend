import type { CategoryName, Color, Size } from "@/types/entities";

export type {
  CategoryName as Category,
  Color,
  Product,
  ProductStatus,
  Review,
  Size,
} from "@/types/entities";

export type SortKey = "price-asc" | "price-desc" | "newest" | "popular";

export interface Filters {
  sizes: Size[];
  colors: Color[];
  categories: CategoryName[];
  priceMin: number;
  priceMax: number;
}

export const SIZE_OPTIONS: Size[] = ["S", "M", "L", "XL"];
export const COLOR_OPTIONS: Color[] = ["Black", "White", "Blue", "Red"];
export const CATEGORY_OPTIONS: CategoryName[] = [
  "Kurti", "Co-ords Sets", "Dresses", "T-Shirts", "Oversized T-Shirts", "Hoodies",
];
export const PRICE_MIN = 0;
export const PRICE_MAX = 2000;
export const COLOR_SWATCH: Record<Color, string> = {
  Black: "#111111", White: "#f5f5f5", Blue: "#2563eb", Red: "#dc2626",
};
