import { useMemo } from "react";
import type { Filters, Product, SortKey } from "../types";

export function matchesCategory(filterCat: string, productCat?: string | null): boolean {
  if (!productCat || !filterCat) return false;
  const f = filterCat.trim().toLowerCase();
  const p = productCat.trim().toLowerCase();
  if (f === p) return true;
  if (f.replace(/[\s_]+/g, "-") === p.replace(/[\s_]+/g, "-")) return true;
  const fNorm = f.replace(/[-_\s]+/g, "").replace(/sets$/, "set");
  const pNorm = p.replace(/[-_\s]+/g, "").replace(/sets$/, "set");
  return fNorm === pNorm;
}

function matchesFilters(product: Product, filters: Filters): boolean {
  if (
    filters.sizes.length > 0 &&
    !filters.sizes.some((s) => product.size.includes(s))
  ) {
    return false;
  }
  if (
    filters.colors.length > 0 &&
    !filters.colors.some((c) => product.color.includes(c))
  ) {
    return false;
  }
  if (
    filters.categories.length > 0 &&
    !filters.categories.some((c) =>
      matchesCategory(c, product.category || (product as { categoryName?: string }).categoryName),
    )
  ) {
    return false;
  }
  if (product.price < filters.priceMin || product.price > filters.priceMax) {
    return false;
  }
  return true;
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "popular":
      return copy.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    case "relevance":
      return copy;
    case "newest":
      return copy.sort(
        (a, b) =>
          (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0),
      );
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    default:
      return copy;
  }
}

export function useFilteredSortedProducts(
  products: Product[],
  filters: Filters,
  sort: SortKey,
): Product[] {
  return useMemo(() => {
    const filtered = products.filter((p) => matchesFilters(p, filters));
    return sortProducts(filtered, sort);
  }, [products, filters, sort]);
}
