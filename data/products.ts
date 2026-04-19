// Re-exports the canonical storefront product catalog so admin and store
// share a single source of truth. The catalog itself lives alongside the
// product feature so its types + review seeds stay co-located.
export {
  PRODUCTS,
  getProductById,
  getRelatedProducts,
} from "@/features/product/data/products";
export type { Product, ProductStatus } from "@/features/product/types";
