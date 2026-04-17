"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
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
    <Container className="py-10 lg:py-14">
      <SectionHeader
        size="lg"
        eyebrow="Shop"
        title="New arrivals & essentials"
        description="Browse the full KamiraFit collection. Filter by category, size, color and price to find your next favorite piece."
        className="mb-10"
      />

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
    </Container>
  );
}
