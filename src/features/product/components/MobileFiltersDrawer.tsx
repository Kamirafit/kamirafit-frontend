"use client";

import { useEffect } from "react";
import type { Color, Filters, Size } from "../types";
import FiltersSidebar from "./FiltersSidebar";
import { CloseIcon } from "./icons";

type Counts = {
  categories: Record<string, number>;
  sizes: Record<Size, number>;
  colors: Record<Color, number>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  counts: Counts;
  onChange: (next: Filters) => void;
  onReset: () => void;
  showCategoryFilter?: boolean;
};

export default function MobileFiltersDrawer({
  open,
  onClose,
  filters,
  counts,
  onChange,
  onReset,
  showCategoryFilter = true,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
    >
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="flex-1 bg-primary/40 backdrop-blur-sm transition-opacity"
      />
      <div className="flex h-full w-[88%] max-w-sm flex-col border-l border-outline-variant/30 bg-surface-container-lowest shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-6 py-4">
          <h2 className="font-serif text-lg font-medium text-primary tracking-tight">
            Refine Selection
          </h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary-container hover:text-white transition-colors cursor-pointer"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto modal-scrollbar-hidden px-5 py-6">
          <FiltersSidebar
            filters={filters}
            counts={counts}
            onChange={onChange}
            onReset={onReset}
            showCategoryFilter={showCategoryFilter}
            className="border-none shadow-none p-0 bg-transparent max-h-none overflow-visible"
          />
        </div>

        <div className="border-t border-outline-variant/30 px-6 py-4 bg-surface-container-lowest">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 rounded-full bg-primary-container text-white font-sans text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-all shadow-md cursor-pointer"
          >
            View Results
          </button>
        </div>
      </div>
    </div>
  );
}
