export type Size = "S" | "M" | "L" | "XL";

export type Color = "Black" | "White" | "Blue" | "Red";

export type Category = "Oversized" | "Regular" | "Hoodies";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  size: Size[];
  color: Color[];
  rating: number;
  image: string;
  createdAt: string;
  popularity: number;
};

export type SortKey =
  | "price-asc"
  | "price-desc"
  | "newest"
  | "popular";

export type Filters = {
  sizes: Size[];
  colors: Color[];
  categories: Category[];
  priceMin: number;
  priceMax: number;
};

export const SIZE_OPTIONS: Size[] = ["S", "M", "L", "XL"];
export const COLOR_OPTIONS: Color[] = ["Black", "White", "Blue", "Red"];
export const CATEGORY_OPTIONS: Category[] = [
  "Oversized",
  "Regular",
  "Hoodies",
];

export const PRICE_MIN = 0;
export const PRICE_MAX = 2000;

export const COLOR_SWATCH: Record<Color, string> = {
  Black: "#111111",
  White: "#f5f5f5",
  Blue: "#2563eb",
  Red: "#dc2626",
};
