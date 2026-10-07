"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import { useFilteredSortedProducts, matchesCategory } from "../hooks/useFilteredSortedProducts";
import {
  COLOR_OPTIONS,
  PRICE_MAX,
  PRICE_MIN,
  SIZE_OPTIONS,
  type Color,
  type Filters,
  type Size,
  type SortKey,
} from "../types";
import FiltersSidebar from "./FiltersSidebar";
import MobileFiltersDrawer from "./MobileFiltersDrawer";
import ProductGrid from "./ProductGrid";
import SortBar from "./SortBar";
import { useProducts, useColors } from "@/services/product";
import type { Product } from "@/types/entities";
import { ErrorState, OfflineState } from "@/components/states";
import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const PARENT_COLLECTIONS: Record<string, { label: string; categories: string[] }> = {
  "western-wear": {
    label: "Western Wear",
    categories: ["Dresses", "Coord Sets", "Co-ords Sets"],
  },
  western: {
    label: "Western Wear",
    categories: ["Dresses", "Coord Sets", "Co-ords Sets"],
  },
  "indo-western": {
    label: "Indo-Western",
    categories: ["Coord Sets", "Co-ords Sets"],
  },
  "indian-wear": {
    label: "Indian Wear",
    categories: ["Kurti", "2 Piece Sets (Indian)", "3 Piece Sets (Indian)"],
  },
  indian: {
    label: "Indian Wear",
    categories: ["Kurti", "2 Piece Sets (Indian)", "3 Piece Sets (Indian)"],
  },
  unisex: {
    label: "Unisex Collections",
    categories: ["Regular Fit T-Shirts", "T-Shirts", "Oversized T-Shirts", "Hoodies"],
  },
  "unisex-collections": {
    label: "Unisex Collections",
    categories: ["Regular Fit T-Shirts", "T-Shirts", "Oversized T-Shirts", "Hoodies"],
  },
  "unisex-t-shirts": {
    label: "Unisex T-Shirts",
    categories: ["Regular Fit T-Shirts", "T-Shirts", "Oversized T-Shirts", "Hoodies"],
  },
};

const CATEGORY_BY_SLUG: Record<string, string> = {
  kurti: "Kurti",
  kurtis: "Kurti",
  "co-ords-sets": "Coord Sets",
  "coord-sets": "Coord Sets",
  coords: "Coord Sets",
  dresses: "Dresses",
  dress: "Dresses",
  tshirts: "Regular Fit T-Shirts",
  "t-shirts": "Regular Fit T-Shirts",
  "regular-fit-tshirts": "Regular Fit T-Shirts",
  "oversized-tshirts": "Oversized T-Shirts",
  "oversized-t-shirts": "Oversized T-Shirts",
  hoodies: "Hoodies",
  hoodie: "Hoodies",
  "indian-2-piece-sets": "2 Piece Sets (Indian)",
  "indian-3-piece-sets": "3 Piece Sets (Indian)",
};

interface ParsedCategory {
  title: string;
  categories: string[];
}

function parseCategory(slugOrName?: string | null): ParsedCategory | null {
  if (!slugOrName) return null;
  const decoded = decodeURIComponent(slugOrName).trim();
  const lower = decoded.toLowerCase();
  const kebab = lower.replace(/[\s_]+/g, "-");

  // 1. Check parent collections (e.g. "western-wear", "indian-wear", "unisex")
  if (PARENT_COLLECTIONS[kebab]) {
    return {
      title: PARENT_COLLECTIONS[kebab].label,
      categories: PARENT_COLLECTIONS[kebab].categories,
    };
  }

  // 2. Check individual categories by slug
  if (CATEGORY_BY_SLUG[kebab]) {
    const cat = CATEGORY_BY_SLUG[kebab];
    return {
      title: cat,
      categories: [cat],
    };
  }

  // 3. Fallback for any unknown category slug
  const title = decoded
    .split(/[-_ ]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    title,
    categories: [title],
  };
}

function getInitialFilters(categorySlug?: string): Filters {
  const parsed = parseCategory(categorySlug);

  return {
    ...INITIAL_FILTERS,
    categories: parsed ? parsed.categories : [],
  };
}

const INITIAL_FILTERS: Filters = {
  sizes: [],
  colors: [],
  categories: [],
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
};

type Props = {
  initialCategorySlug?: string;
  initialProducts?: Product[];
  initialError?: boolean;
};

export default function ShopPageClient({
  initialCategorySlug,
  initialProducts = [],
  initialError = false,
}: Props) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | undefined>(
    initialCategorySlug,
  );
  const [filters, setFilters] = useState<Filters>(() =>
    getInitialFilters(initialCategorySlug),
  );
  const [sort, setSort] = useState<SortKey>("popular");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let slug = initialCategorySlug;
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCategory = urlParams.get("category");
      if (urlCategory !== null) {
        slug = urlCategory;
      }
    }
    setActiveCategorySlug(slug || undefined);
    const parsed = parseCategory(slug);
    setFilters((prev) => ({
      ...prev,
      categories: parsed ? parsed.categories : [],
    }));
  }, [initialCategorySlug]);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get("category");
      setActiveCategorySlug(slug || undefined);
      const parsed = parseCategory(slug);
      setFilters((prev) => ({
        ...prev,
        categories: parsed ? parsed.categories : [],
      }));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleViewAllProducts = () => {
    setActiveCategorySlug(undefined);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/shop");
    }
    setFilters(INITIAL_FILTERS);
  };

  const handleResetFilters = () => {
    setActiveCategorySlug(undefined);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/shop");
    }
    setFilters(INITIAL_FILTERS);
  };

  const productsQuery = useProducts();
  const colorsQuery = useColors();
  const { data: latestProducts = [], isError, refetch } = productsQuery;
  const isOnline = useOnlineStatus();

  const activeProducts = useMemo(() => {
    const source = latestProducts.length > 0 ? latestProducts : initialProducts;
    return source.filter((p) => p.status === "active");
  }, [latestProducts, initialProducts]);

  const products = useFilteredSortedProducts(activeProducts, filters, sort);
  const isUpdating = productsQuery.isLoading || productsQuery.isFetching;

  // Category collection route from navigation (e.g. /category/dresses or ?category=western-wear)
  const isCategoryRoute = Boolean(activeCategorySlug);
  const isViewingAllProducts = !activeCategorySlug && filters.categories.length === 0;

  const parsedActiveCategory = useMemo(() => {
    return parseCategory(activeCategorySlug);
  }, [activeCategorySlug]);

  const activeCategoryTitle =
    parsedActiveCategory?.title || (filters.categories.length > 0 ? filters.categories.join(", ") : undefined);

  // Products matching all filters EXCEPT category (price, size, color)
  const productsForCategoryCounts = useMemo(() => {
    return activeProducts.filter((p) => {
      if (
        filters.sizes.length > 0 &&
        !filters.sizes.some((s) => p.size.includes(s))
      ) {
        return false;
      }
      if (
        filters.colors.length > 0 &&
        !filters.colors.some((c) => p.color.includes(c))
      ) {
        return false;
      }
      if (p.price < filters.priceMin || p.price > filters.priceMax) {
        return false;
      }
      return true;
    });
  }, [activeProducts, filters.sizes, filters.colors, filters.priceMin, filters.priceMax]);

  // Counts are computed dynamically from the products set
  const counts = useMemo(() => {
    const cat: Record<string, number> = {};
    const sz = {} as Record<Size, number>;
    const col = {} as Record<Color, number>;
    for (const s of SIZE_OPTIONS) sz[s] = 0;
    for (const c of COLOR_OPTIONS) col[c] = 0;
    if (colorsQuery.data && Array.isArray(colorsQuery.data)) {
      for (const c of colorsQuery.data) {
        if (c.name) col[c.name] = 0;
      }
    }

    // Category counts derived dynamically from products matching other filters
    for (const p of productsForCategoryCounts) {
      const rawCat = (p as { categoryName?: string }).categoryName || p.category;
      const catName = typeof rawCat === "string" ? rawCat : (rawCat as { name?: string } | undefined)?.name;
      if (catName && typeof catName === "string" && catName.trim()) {
        const trimmed = catName.trim();
        cat[trimmed] = (cat[trimmed] ?? 0) + 1;
      }
    }

    const relevantProducts =
      filters.categories.length > 0
        ? activeProducts.filter((p) =>
            filters.categories.some((fc) => matchesCategory(fc, p.category || (p as { categoryName?: string }).categoryName)),
          )
        : activeProducts;

    for (const p of relevantProducts) {
      for (const s of p.size) sz[s] = (sz[s] ?? 0) + 1;
      for (const c of p.color) col[c] = (col[c] ?? 0) + 1;
    }
    return { categories: cat, sizes: sz, colors: col };
  }, [activeProducts, productsForCategoryCounts, colorsQuery.data, filters.categories]);

  const activeFilterCount = useMemo(() => {
    let count = filters.categories.length + filters.sizes.length + filters.colors.length;
    if (filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX) {
      count += 1;
    }
    return count;
  }, [filters]);

  const removeSizeFilter = (s: Size) => {
    setFilters((prev) => ({ ...prev, sizes: prev.sizes.filter((sz) => sz !== s) }));
  };

  const removeColorFilter = (c: Color) => {
    setFilters((prev) => ({ ...prev, colors: prev.colors.filter((cl) => cl !== c) }));
  };

  const removePriceFilter = () => {
    setFilters((prev) => ({ ...prev, priceMin: PRICE_MIN, priceMax: PRICE_MAX }));
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      <Container className="py-8 lg:py-12 max-w-[1380px]">
        {/* Editorial Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="text-[11px] uppercase tracking-[0.18em] font-sans text-secondary mb-6"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" scroll={true} className="transition-colors hover:text-primary">
                Atelier
              </Link>
            </li>
            <li aria-hidden="true" className="text-outline-variant/80">
              /
            </li>
            <li>
              {!isViewingAllProducts ? (
                <button
                  type="button"
                  onClick={handleViewAllProducts}
                  className="transition-colors hover:text-primary uppercase cursor-pointer"
                >
                  Collection
                </button>
              ) : (
                <span className="text-primary font-semibold">Collection</span>
              )}
            </li>
            {!isViewingAllProducts && activeCategoryTitle && (
              <>
                <li aria-hidden="true" className="text-outline-variant/80">
                  /
                </li>
                <li className="text-primary font-semibold uppercase">
                  {activeCategoryTitle}
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Main Layout: Sticky Sidebar (3 Cols) + Product Canvas (9 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-6">
            <FiltersSidebar
              filters={filters}
              counts={counts}
              onChange={(nextFilters) => {
                if (nextFilters.categories.length === 0 && activeCategorySlug) {
                  setActiveCategorySlug(undefined);
                  if (typeof window !== "undefined") {
                    window.history.replaceState(null, "", "/shop");
                  }
                }
                setFilters(nextFilters);
              }}
              onReset={handleResetFilters}
              showCategoryFilter={!isCategoryRoute}
            />
          </aside>

          {/* Product Canvas */}
          <main className="col-span-1 lg:col-span-9 w-full min-w-0">
            {/* Catalog Top Toolbar */}
            <SortBar
              sort={sort}
              onSortChange={setSort}
              totalCount={products.length}
              onOpenMobileFilters={() => setMobileOpen(true)}
              activeFilterCount={activeFilterCount}
              onResetFilters={handleResetFilters}
            />

            {/* Active Filter Badges */}
            {(activeFilterCount > 0 || (!isViewingAllProducts && activeCategoryTitle)) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-xs text-secondary font-medium">Active:</span>

                {!isViewingAllProducts && activeCategoryTitle && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1 text-xs font-medium text-primary shadow-sm">
                    {activeCategoryTitle}
                    <button
                      type="button"
                      onClick={handleViewAllProducts}
                      className="hover:text-surface-tint transition-colors font-bold ml-0.5 cursor-pointer"
                      aria-label={`Remove ${activeCategoryTitle} filter`}
                    >
                      ✕
                    </button>
                  </span>
                )}

                {filters.sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1 text-xs font-medium text-primary shadow-sm"
                  >
                    Size: {s}
                    <button
                      type="button"
                      onClick={() => removeSizeFilter(s)}
                      className="hover:text-surface-tint transition-colors font-bold ml-0.5 cursor-pointer"
                      aria-label={`Remove size ${s} filter`}
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {filters.colors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1 text-xs font-medium text-primary shadow-sm"
                  >
                    Color: {c}
                    <button
                      type="button"
                      onClick={() => removeColorFilter(c)}
                      className="hover:text-surface-tint transition-colors font-bold ml-0.5 cursor-pointer"
                      aria-label={`Remove color ${c} filter`}
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {(filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest px-3 py-1 text-xs font-medium text-primary shadow-sm">
                    ₹{filters.priceMin} – ₹{filters.priceMax}
                    <button
                      type="button"
                      onClick={removePriceFilter}
                      className="hover:text-surface-tint transition-colors font-bold ml-0.5 cursor-pointer"
                      aria-label="Remove price filter"
                    >
                      ✕
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-surface-tint hover:underline transition-colors font-semibold uppercase tracking-wider ml-1 cursor-pointer"
                >
                  Reset all
                </button>
              </div>
            )}

            {/* Products Grid / Skeletons / States */}
            <div>
              {!isOnline && activeProducts.length === 0 ? (
                <OfflineState onRetry={() => void refetch()} />
              ) : isUpdating && activeProducts.length === 0 ? (
                <ProductGridSkeleton count={8} />
              ) : (isError || (initialError && latestProducts.length === 0)) && activeProducts.length === 0 ? (
                <ErrorState
                  title="Catalog Unavailable"
                  message="We couldn't load the garments right now. Please try again."
                  onRetry={() => void refetch()}
                />
              ) : (
                <ProductGrid products={products} onResetFilters={handleResetFilters} />
              )}
            </div>

            {/* Minimalist Summary Footer */}
            {products.length > 0 && (
              <div className="mt-14 pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-sans text-xs text-secondary">
                  Showing {products.length} {products.length === 1 ? "garment" : "garments"}
                </span>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-xs font-semibold uppercase tracking-wider text-surface-tint hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Back to Top ↑
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Mobile Filters Drawer */}
        <MobileFiltersDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          filters={filters}
          counts={counts}
          onChange={(nextFilters) => {
            if (nextFilters.categories.length === 0 && activeCategorySlug) {
              setActiveCategorySlug(undefined);
              if (typeof window !== "undefined") {
                window.history.replaceState(null, "", "/shop");
              }
            }
            setFilters(nextFilters);
          }}
          onReset={handleResetFilters}
          showCategoryFilter={!isCategoryRoute}
        />
      </Container>
    </div>
  );
}
