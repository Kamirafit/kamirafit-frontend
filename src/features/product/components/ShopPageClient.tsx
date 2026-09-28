"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import { useFilteredSortedProducts } from "../hooks/useFilteredSortedProducts";
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  PRICE_MAX,
  PRICE_MIN,
  SIZE_OPTIONS,
  type Category,
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

const PARENT_COLLECTIONS: Record<string, { label: string; categories: Category[] }> = {
  "western-wear": {
    label: "Western Wear",
    categories: ["Dresses", "Co-ords Sets"],
  },
  western: {
    label: "Western Wear",
    categories: ["Dresses", "Co-ords Sets"],
  },
  "indo-western": {
    label: "Indo-Western",
    categories: ["Co-ords Sets"],
  },
  "indian-wear": {
    label: "Indian Wear",
    categories: ["Kurti"],
  },
  indian: {
    label: "Indian Wear",
    categories: ["Kurti"],
  },
  unisex: {
    label: "Unisex Collections",
    categories: ["T-Shirts", "Oversized T-Shirts", "Hoodies"],
  },
  "unisex-collections": {
    label: "Unisex Collections",
    categories: ["T-Shirts", "Oversized T-Shirts", "Hoodies"],
  },
  "unisex-t-shirts": {
    label: "Unisex T-Shirts",
    categories: ["T-Shirts", "Oversized T-Shirts", "Hoodies"],
  },
};

const CATEGORY_BY_SLUG: Record<string, Category> = {
  kurti: "Kurti",
  "co-ords-sets": "Co-ords Sets",
  "coord-sets": "Co-ords Sets",
  coords: "Co-ords Sets",
  dresses: "Dresses",
  dress: "Dresses",
  tshirts: "T-Shirts",
  "t-shirts": "T-Shirts",
  "oversized-tshirts": "Oversized T-Shirts",
  "oversized-t-shirts": "Oversized T-Shirts",
  hoodies: "Hoodies",
  hoodie: "Hoodies",
};

interface ParsedCategory {
  title: string;
  categories: Category[];
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

  // 2. Check individual categories
  if (CATEGORY_BY_SLUG[kebab]) {
    const cat = CATEGORY_BY_SLUG[kebab];
    return {
      title: cat,
      categories: [cat],
    };
  }

  // 3. Check exact match in CATEGORY_OPTIONS
  const option = CATEGORY_OPTIONS.find(
    (c) => c.toLowerCase() === lower || c.toLowerCase().replace(/[\s_]+/g, "-") === kebab,
  );
  if (option) {
    return {
      title: option,
      categories: [option],
    };
  }

  // 4. Fallback for any unknown category slug
  const title = decoded
    .split(/[-_ ]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    title,
    categories: [],
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
};

export default function ShopPageClient({ initialCategorySlug, initialProducts = [] }: Props) {
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

  // The category filter should only be present if the user is viewing all products (/shop)
  const isViewingAllProducts = !activeCategorySlug && filters.categories.length === 0;

  const parsedActiveCategory = useMemo(() => {
    return parseCategory(activeCategorySlug);
  }, [activeCategorySlug]);

  const activeCategoryTitle =
    parsedActiveCategory?.title || (filters.categories.length > 0 ? filters.categories.join(", ") : undefined);

  // Counts are computed from the active products set
  const counts = useMemo(() => {
    const cat = {} as Record<Category, number>;
    const sz = {} as Record<Size, number>;
    const col = {} as Record<Color, number>;
    for (const c of CATEGORY_OPTIONS) cat[c] = 0;
    for (const s of SIZE_OPTIONS) sz[s] = 0;
    for (const c of COLOR_OPTIONS) col[c] = 0;
    if (colorsQuery.data && Array.isArray(colorsQuery.data)) {
      for (const c of colorsQuery.data) {
        if (c.name) col[c.name] = 0;
      }
    }

    const relevantProducts =
      filters.categories.length > 0
        ? activeProducts.filter((p) =>
            filters.categories.some(
              (fc) =>
                fc.toLowerCase() === p.category?.toLowerCase() ||
                fc.toLowerCase().replace(/[\s_]+/g, "-") ===
                  p.category?.toLowerCase().replace(/[\s_]+/g, "-"),
            ),
          )
        : activeProducts;

    for (const p of activeProducts) {
      if (p.category && cat[p.category] !== undefined) {
        cat[p.category] = (cat[p.category] ?? 0) + 1;
      }
    }
    for (const p of relevantProducts) {
      for (const s of p.size) sz[s] = (sz[s] ?? 0) + 1;
      for (const c of p.color) col[c] = (col[c] ?? 0) + 1;
    }
    return { categories: cat, sizes: sz, colors: col };
  }, [activeProducts, colorsQuery.data, filters.categories]);

  return (
    <Container className="py-8 lg:py-10">
      <nav
        aria-label="Breadcrumb"
        className="text-[11px] uppercase tracking-[0.22em] text-paper-muted"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" scroll={true} className="transition-colors hover:text-gold">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-line-strong">
            /
          </li>
          <li>
            {!isViewingAllProducts ? (
              <button
                type="button"
                onClick={handleViewAllProducts}
                className="transition-colors hover:text-gold uppercase"
              >
                Shop
              </button>
            ) : (
              <span className="text-gold">Shop</span>
            )}
          </li>
          {!isViewingAllProducts && activeCategoryTitle && (
            <>
              <li aria-hidden="true" className="text-line-strong">
                /
              </li>
              <li className="text-gold font-medium uppercase">
                {activeCategoryTitle}
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-6 pr-2 [scrollbar-width:thin]">
            <FiltersSidebar
              filters={filters}
              counts={counts}
              onChange={(nextFilters) => {
                // If user changed category in filters, update activeCategorySlug if cleared
                if (nextFilters.categories.length === 0 && activeCategorySlug) {
                  setActiveCategorySlug(undefined);
                  if (typeof window !== "undefined") {
                    window.history.replaceState(null, "", "/shop");
                  }
                }
                setFilters(nextFilters);
              }}
              onReset={handleResetFilters}
              showCategoryFilter={isViewingAllProducts}
            />
          </div>
        </aside>

        <section className="min-w-0">
          <SortBar
            sort={sort}
            onSortChange={setSort}
            totalCount={products.length}
            onOpenMobileFilters={() => setMobileOpen(true)}
          />

          {!isViewingAllProducts && activeCategoryTitle && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-paper-muted">Category:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                {activeCategoryTitle}
                <button
                  type="button"
                  onClick={handleViewAllProducts}
                  className="hover:text-gold-bright transition-colors font-bold ml-0.5"
                  aria-label={`Remove ${activeCategoryTitle} filter and view all products`}
                >
                  ✕
                </button>
              </span>
              <button
                type="button"
                onClick={handleViewAllProducts}
                className="text-xs text-paper-muted underline underline-offset-2 transition-colors hover:text-gold ml-1"
              >
                View all products
              </button>
            </div>
          )}

          <div className="mt-6">
            {!isOnline && latestProducts.length === 0 ? (
              <OfflineState onRetry={() => void refetch()} />
            ) : isUpdating ? (
              <ProductGridSkeleton count={8} />
            ) : isError && latestProducts.length === 0 ? (
              <ErrorState message="We couldn’t load the shop right now." onRetry={() => void refetch()} />
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </section>
      </div>

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
        showCategoryFilter={isViewingAllProducts}
      />
    </Container>
  );
}
