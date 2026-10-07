"use client";

import type { SortKey } from "../types";
import { ChevronDownIcon, CloseIcon, TuneIcon } from "./icons";

type Props = {
  sort: SortKey;
  onSortChange: (next: SortKey) => void;
  totalCount: number;
  onOpenMobileFilters: () => void;
  activeFilterCount?: number;
  onResetFilters?: () => void;
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Popularity" },
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function SortBar({
  sort,
  onSortChange,
  totalCount,
  onOpenMobileFilters,
  activeFilterCount = 0,
  onResetFilters,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-outline-variant/30">
      {/* Garment Count */}
      <div className="flex items-center gap-2 text-xs text-secondary font-sans">
        <span className="font-serif text-lg sm:text-xl font-medium text-primary">
          {totalCount}
        </span>
        <span className="tracking-wide">
          {totalCount === 1 ? "garment curated" : "garments curated"}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Active Filter Pill Counter */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container/60 text-on-secondary-container font-sans text-xs font-medium">
            <span>Filters: {activeFilterCount} active</span>
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                aria-label="Clear active filters"
                className="ml-1 hover:text-primary flex items-center transition-colors cursor-pointer"
              >
                <CloseIcon width={13} height={13} />
              </button>
            )}
          </div>
        )}

        {/* Sort Select Menu */}
        <div className="flex items-center gap-2 pl-3.5 pr-2.5 py-1 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-sm transition-colors hover:border-primary-container/40">
          <span className="font-sans text-xs text-secondary uppercase font-medium shrink-0">
            Sort by:
          </span>
          <div className="relative inline-flex items-center">
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              className="bg-transparent text-primary font-sans text-xs font-semibold border-0 outline-none ring-0 focus:ring-0 focus:outline-none focus:border-0 cursor-pointer appearance-none [-webkit-appearance:none] [-moz-appearance:none] pr-5 py-1 shadow-none"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                background: "transparent",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-surface-container-lowest text-primary py-1"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-0 text-secondary flex items-center">
              <ChevronDownIcon width={14} height={14} />
            </span>
          </div>
        </div>

        {/* Mobile Filter Drawer Toggle Button */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container text-white font-sans text-xs font-semibold hover:bg-primary transition-all shadow-sm cursor-pointer"
        >
          <TuneIcon width={16} height={16} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-primary-container text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

