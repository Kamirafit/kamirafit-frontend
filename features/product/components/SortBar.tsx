"use client";

import { buttonClasses } from "@/components/ui/Button";
import type { SortKey } from "../types";
import { ChevronDownIcon, FilterIcon } from "./icons";

type Props = {
  sort: SortKey;
  onSortChange: (next: SortKey) => void;
  totalCount: number;
  onOpenMobileFilters: () => void;
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
];

export default function SortBar({
  sort,
  onSortChange,
  totalCount,
  onOpenMobileFilters,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
      <p className="text-sm text-paper-muted">
        <span className="font-semibold text-gold">{totalCount}</span>{" "}
        {totalCount === 1 ? "product" : "products"}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className={`${buttonClasses("secondary", "sm")} lg:hidden`}
        >
          <FilterIcon width={16} height={16} />
          Filters
        </button>

        <label className="relative inline-flex items-center">
          <span className="sr-only">Sort products by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="appearance-none rounded-full border border-line bg-ink-2 py-2.5 pl-4 pr-10 text-[12px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:border-gold focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-ink text-paper">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            width={14}
            height={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold"
          />
        </label>
      </div>
    </div>
  );
}
