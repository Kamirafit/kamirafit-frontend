"use client";

import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/Button";
import type { Category, Color, Filters, Size } from "../types";
import FiltersSidebar from "./FiltersSidebar";
import { CloseIcon } from "./icons";

type Counts = {
  categories: Record<Category, number>;
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
};

export default function MobileFiltersDrawer({
  open,
  onClose,
  filters,
  counts,
  onChange,
  onReset,
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
        className="flex-1 bg-ink/70 backdrop-blur-sm"
      />
      <div className="flex h-full w-[88%] max-w-sm flex-col border-l border-line bg-ink shadow-[0_0_80px_-20px_rgba(74,14,26,0.12)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
            Filters
          </h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="rounded-full p-1.5 text-paper-muted transition-colors hover:bg-ink-3 hover:text-gold"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto modal-scrollbar-hidden px-5 py-6">
          <FiltersSidebar
            filters={filters}
            counts={counts}
            onChange={onChange}
            onReset={onReset}
          />
        </div>

        <div className="border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className={`${buttonClasses("primary", "md")} w-full`}
          >
            View results
          </button>
        </div>
      </div>
    </div>
  );
}
