"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/features/product/components/ProductCard";
import type { Product } from "@/types/entities";

type Props = {
  products: Product[];
};

type FilterChip = {
  id: string;
  label: string;
  keywords: string[];
};

const FILTER_CHIPS: FilterChip[] = [
  { id: "all", label: "All Works", keywords: [] },
  { id: "co-ords-sets", label: "Co-ord Sets", keywords: ["co-ord", "coord", "two-piece", "set"] },
  { id: "dresses", label: "Dresses & Silks", keywords: ["dress", "gown", "slip", "satin", "midi"] },
  { id: "kurti", label: "Kurtis & Indian", keywords: ["kurti", "indian", "ethnic", "festive"] },
  { id: "unisex-collections", label: "Unisex Street", keywords: ["t-shirt", "tee", "hoodie", "street", "fleece", "unisex"] },
];

export default function CategoryHighlights({ products = [] }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Determine dynamic chips if products contain distinct categories
  const chips = useMemo(() => {
    // Check if each filter has at least 1 matching product
    const validChips = FILTER_CHIPS.filter((chip) => {
      if (chip.id === "all") return true;
      return products.some((p) => {
        const text = `${p.name || ""} ${p.category || ""} ${p.categoryName || ""} ${p.subcategory || ""} ${p.description || ""}`.toLowerCase();
        return chip.keywords.some((k) => text.includes(k));
      });
    });

    // If only "All Works" matched, dynamically create chips from product categories
    if (validChips.length <= 1 && products.length > 0) {
      const catMap = new Map<string, string>();
      products.forEach((p) => {
        const cat = p.categoryName || p.category;
        if (typeof cat === "string" && cat.trim()) {
          const slug = cat.toLowerCase().replace(/[\s_]+/g, "-");
          if (!catMap.has(slug)) {
            catMap.set(slug, cat.trim());
          }
        }
      });

      const dynamicList: FilterChip[] = [{ id: "all", label: "All Works", keywords: [] }];
      catMap.forEach((label, id) => {
        dynamicList.push({ id, label, keywords: [label.toLowerCase()] });
      });
      return dynamicList.slice(0, 5);
    }

    return validChips.length > 1 ? validChips : FILTER_CHIPS;
  }, [products]);

  // All matching products for active category
  const allCategoryProducts = useMemo(() => {
    if (activeFilter === "all" || products.length === 0) {
      return products;
    }

    const currentChip = chips.find((c) => c.id === activeFilter);
    const keywords = currentChip?.keywords || [activeFilter.toLowerCase()];

    const matched = products.filter((p) => {
      const text = `${p.name || ""} ${p.category || ""} ${p.categoryName || ""} ${p.subcategory || ""} ${p.description || ""}`.toLowerCase();
      return keywords.some((k) => text.includes(k));
    });

    return matched.length > 0 ? matched : products;
  }, [products, activeFilter, chips]);

  // Section shows strictly ONE row of products (4 items in 4-column grid)
  const oneRowProducts = useMemo(() => {
    return allCategoryProducts.slice(0, 4);
  }, [allCategoryProducts]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 sm:py-10 lg:py-12 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8" id="product-grid">
      {/* Section Title & Taxonomy Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <span className="text-surface-tint text-xs uppercase tracking-[0.25em] font-semibold block mb-2">
            Category Highlights
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-primary font-normal tracking-tight">
            Built for the way you wear it.
          </h2>
          <p className="mt-3 text-on-surface-variant font-sans text-sm sm:text-base max-w-xl font-light leading-relaxed">
            Silhouettes constructed with micro-calibrated draping, seamless seams, and hand-finished hems.
          </p>
        </div>

        {/* Luxury Pill Filter Chips on Top Right */}
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => {
            const isActive = activeFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveFilter(chip.id)}
                aria-pressed={isActive}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary-container text-white shadow-sm scale-102"
                    : "bg-surface-container hover:bg-surface-container-high text-primary"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Product Grid - Strictly 1 row of products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {oneRowProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
