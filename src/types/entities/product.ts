import { EntityId, ISODateTimeString } from "./common";
import { CategoryName } from "./category";
import { Review } from "./review";

export const PRODUCT_SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof PRODUCT_SIZES)[number];

export const PRODUCT_COLORS = ["Black", "White", "Blue", "Red"] as const;
export type Color = (typeof PRODUCT_COLORS)[number];

export const PRODUCT_STATUSES = ["active", "inactive"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  id: EntityId;
  name: string;
  price: number;
  category: CategoryName;
  size: Size[];
  color: Color[];
  rating: number;
  image: string;
  images: string[];
  description: string;
  reviews: Review[];
  createdAt: ISODateTimeString;
  popularity: number;
  status: ProductStatus;
}
