import { useMemo } from "react";
import type { Filters, Product, SortKey } from "../types";

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
    !filters.categories.includes(product.category)
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
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "newest":
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "popular":
      return copy.sort((a, b) => b.popularity - a.popularity);
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
