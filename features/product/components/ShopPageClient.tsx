"use client";

import { useState } from "react";
import { PRODUCTS } from "../data/products";
import { useFilteredSortedProducts } from "../hooks/useFilteredSortedProducts";
import { PRICE_MAX, PRICE_MIN, type Filters, type SortKey } from "../types";
import FiltersSidebar from "./FiltersSidebar";
import MobileFiltersDrawer from "./MobileFiltersDrawer";
import ProductGrid from "./ProductGrid";
import SortBar from "./SortBar";

const INITIAL_FILTERS: Filters = {
  sizes: [],
  colors: [],
  categories: [],
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
};

export default function ShopPageClient() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [sort, setSort] = useState<SortKey>("popular");
  const [mobileOpen, setMobileOpen] = useState(false);

  const products = useFilteredSortedProducts(PRODUCTS, filters, sort);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="mb-10 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Shop
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          New arrivals &amp; essentials
        </h1>
        <p className="max-w-xl text-sm text-neutral-600">
          Browse the full KamiraFit collection. Filter by category, size, color
          and price to find your next favorite piece.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FiltersSidebar
              filters={filters}
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
          <div className="mt-8">
            <ProductGrid products={products} />
          </div>
        </section>
      </div>

      <MobileFiltersDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />
    </div>
  );
}
