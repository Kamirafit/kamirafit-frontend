"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Container from "@/components/ui/Container";
import { PRODUCTS } from "../data/products";
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

  // Counts are computed from the full product set so users can see how many
  // items each option would add — not the already-filtered subset.
  const counts = useMemo(() => {
    const cat = {} as Record<Category, number>;
    const sz = {} as Record<Size, number>;
    const col = {} as Record<Color, number>;
    for (const c of CATEGORY_OPTIONS) cat[c] = 0;
    for (const s of SIZE_OPTIONS) sz[s] = 0;
    for (const c of COLOR_OPTIONS) col[c] = 0;
    for (const p of PRODUCTS) {
      cat[p.category] = (cat[p.category] ?? 0) + 1;
      for (const s of p.size) sz[s] = (sz[s] ?? 0) + 1;
      for (const c of p.color) col[c] = (col[c] ?? 0) + 1;
    }
    return { categories: cat, sizes: sz, colors: col };
  }, []);

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

      <section
        aria-label="Kamira collection"
        className="mt-5 overflow-hidden rounded-2xl border border-line bg-ink"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative h-48 w-full sm:h-full sm:min-h-[220px]">
            <Image
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80"
              alt="Curated hanging clothing rack"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              — Collection
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-[28px]">
              Explore the latest collection of KamiraFit essentials
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-paper-muted">
              Don&rsquo;t miss out on this season&rsquo;s drops — from
              oversized tees to hand-cut hoodies.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
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
