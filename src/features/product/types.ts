import type { Color, Size } from "@/types/entities";

export type {
  CategoryName,
  Color,
  Product,
  ProductStatus,
  Review,
  Size,
} from "@/types/entities";

export type Category = string;

export type SortKey = "popular" | "relevance" | "newest" | "price-asc" | "price-desc";

export interface Filters {
  sizes: Size[];
  colors: Color[];
  categories: string[];
  priceMin: number;
  priceMax: number;
}

export const SIZE_OPTIONS: Size[] = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "Free Size"
];
export const COLOR_OPTIONS: Color[] = [
  "Black", "White", "Blue", "Red", "Green", "Yellow", "Pink", "Beige", "Navy", "Maroon", "Grey"
];
export const CATEGORY_OPTIONS: readonly string[] = [
  "Kurti", "Co-ords Sets", "Dresses", "T-Shirts", "Oversized T-Shirts", "Hoodies",
];
export const PRICE_MIN = 0;
export const PRICE_MAX = 10000;
export const COLOR_SWATCH: Record<string, string> = {
  Black: "#111111", White: "#f5f5f5", Blue: "#2563eb", Red: "#dc2626", Green: "#16a34a", Yellow: "#eab308", Pink: "#ec4899", Beige: "#f5f5dc", Navy: "#1e3a8a", Maroon: "#800000", Grey: "#6b7280",
};
