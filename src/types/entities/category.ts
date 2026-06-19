import { EntityId } from "./common";

export const CATEGORY_NAMES = [
  "Kurti",
  "Co-ords Sets",
  "Dresses",
  "T-Shirts",
  "Oversized T-Shirts",
  "Hoodies",
] as const;
export type CategoryName = (typeof CATEGORY_NAMES)[number];

export const CATEGORY_SLUGS = [
  "kurti",
  "co-ords-sets",
  "dresses",
  "t-shirts",
  "oversized-t-shirts",
  "hoodies",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface Category {
  id: EntityId;
  name: CategoryName;
  slug: CategorySlug;
  image?: string;
  description?: string;
}
