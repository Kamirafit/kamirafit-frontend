"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { useProducts } from "@/services/product";
import type { Product } from "@/types/entities";

const CATEGORY_BY_SLUG: Record<string, Category> = {
  kurti: "Kurti",
  "co-ords-sets": "Co-ords Sets",
  dresses: "Dresses",
  tshirts: "T-Shirts",
  "t-shirts": "T-Shirts",
  "oversized-tshirts": "Oversized T-Shirts",
  "oversized-t-shirts": "Oversized T-Shirts",
  hoodies: "Hoodies",
};

function getInitialFilters(categorySlug?: string): Filters {
  const category = categorySlug
    ? CATEGORY_BY_SLUG[categorySlug.toLowerCase()]
    : undefined;

  return {
    ...INITIAL_FILTERS,
    categories: category ? [category] : [],
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
  const [filters, setFilters] = useState<Filters>(() =>
    getInitialFilters(initialCategorySlug),
  );
  const [sort, setSort] = useState<SortKey>("popular");
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: latestProducts = [] } = useProducts();

  const activeProducts = useMemo(() => {
    const source = latestProducts.length > 0 ? latestProducts : initialProducts;
    return source.filter((p) => p.status === "active");
  }, [latestProducts, initialProducts]);

  const products = useFilteredSortedProducts(activeProducts, filters, sort);

  // Counts are computed from the full *active* product set so users can see how
  // many items each option would add — not the already-filtered subset.
  const counts = useMemo(() => {
    const cat = {} as Record<Category, number>;
    const sz = {} as Record<Size, number>;
    const col = {} as Record<Color, number>;
    for (const c of CATEGORY_OPTIONS) cat[c] = 0;
    for (const s of SIZE_OPTIONS) sz[s] = 0;
    for (const c of COLOR_OPTIONS) col[c] = 0;
    for (const p of activeProducts) {
      cat[p.category] = (cat[p.category] ?? 0) + 1;
      for (const s of p.size) sz[s] = (sz[s] ?? 0) + 1;
      for (const c of p.color) col[c] = (col[c] ?? 0) + 1;
    }
    return { categories: cat, sizes: sz, colors: col };
  }, [activeProducts]);

  return (
    <Container className="py-8 lg:py-10">
      <nav
        aria-label="Breadcrumb"
        className="text-[11px] uppercase tracking-[0.22em] text-paper-muted"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition-colors hover:text-gold">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-line-strong">
            /
          </li>
          <li className="text-gold">Shop</li>
        </ol>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-6 pr-2 [scrollbar-width:thin]">
            <FiltersSidebar
              filters={filters}
              counts={counts}
              onChange={setFilters}
              onReset={() => setFilters(INITIAL_FILTERS)}
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
          <div className="mt-6">
            <ProductGrid products={products} />
          </div>
        </section>
      </div>

      <MobileFiltersDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        filters={filters}
        counts={counts}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />
    </Container>
  );
}
