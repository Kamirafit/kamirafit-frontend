"use client";

import { useEffect } from "react";
import type { Filters } from "../types";
import FiltersSidebar from "./FiltersSidebar";
import { CloseIcon } from "./icons";

type Props = {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
};

export default function MobileFiltersDrawer({
  open,
  onClose,
  filters,
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
        className="flex-1 bg-neutral-900/40"
      />
      <div className="flex h-full w-[88%] max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-semibold text-neutral-900">Filters</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-700 transition-colors hover:bg-neutral-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <FiltersSidebar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
          />
        </div>

        <div className="border-t border-neutral-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            View results
          </button>
        </div>
      </div>
    </div>
  );
}
