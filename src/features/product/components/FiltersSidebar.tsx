"use client";

import { useMemo } from "react";
import {
  COLOR_OPTIONS,
  COLOR_SWATCH,
  PRICE_MAX,
  PRICE_MIN,
  SIZE_OPTIONS,
  type Color,
  type Filters,
  type Size,
} from "../types";
import CheckboxGroup from "./CheckboxGroup";
import PriceSlider from "./PriceSlider";
import { useColors, useColorSwatchMap } from "@/services/product";

type Counts = {
  categories: Record<string, number>;
  sizes: Record<Size, number>;
  colors: Record<Color, number>;
};

type Props = {
  filters: Filters;
  counts: Counts;
  onChange: (next: Filters) => void;
  onReset: () => void;
  showCategoryFilter?: boolean;
  className?: string;
};

export default function FiltersSidebar({
  filters,
  counts,
  onChange,
  onReset,
  showCategoryFilter = true,
  className,
}: Props) {
  const { data: apiColors } = useColors();
  const swatchMap = useColorSwatchMap();

  const categoryOptions = useMemo(() => {
    return Object.entries(counts.categories)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([cat, count]) => ({
        value: cat,
        label: cat,
        count,
      }));
  }, [counts.categories]);

  const colorOptions = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();

    if (apiColors && Array.isArray(apiColors)) {
      apiColors.forEach((c) => {
        if (c.name && !seen.has(c.name)) {
          seen.add(c.name);
          list.push(c.name);
        }
      });
    }

    Object.keys(counts.colors).forEach((c) => {
      if (!seen.has(c)) {
        seen.add(c);
        list.push(c);
      }
    });

    if (list.length === 0) {
      COLOR_OPTIONS.forEach((c) => list.push(c));
    }

    return list;
  }, [apiColors, counts.colors]);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSize = (size: Size) => {
    if (filters.sizes.includes(size)) {
      set(
        "sizes",
        filters.sizes.filter((s) => s !== size),
      );
    } else {
      set("sizes", [...filters.sizes, size]);
    }
  };

  const toggleColor = (color: Color) => {
    if (filters.colors.includes(color)) {
      set(
        "colors",
        filters.colors.filter((c) => c !== color),
      );
    } else {
      set("colors", [...filters.colors, color]);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col max-h-[calc(100vh-7.5rem)] overflow-hidden ${
        className ?? ""
      }`}
    >
      {/* Pinned Header */}
      <div className="flex items-center justify-between p-5 pb-4 border-b border-outline-variant/30 bg-surface-container-lowest rounded-t-2xl shrink-0 z-10">
        <h2 className="font-serif text-lg font-medium text-primary tracking-tight">
          Refine Selection
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-surface-tint hover:underline uppercase tracking-wider cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Separate Scrollable Filter Body */}
      <div className="p-5 pt-4 space-y-6 overflow-y-auto custom-filter-scrollbar flex-1 overscroll-contain">
        {/* Garment Category */}
        {showCategoryFilter && categoryOptions.length > 0 && (
          <>
            <CheckboxGroup<string>
              legend="Garment Category"
              options={categoryOptions}
              selected={filters.categories}
              onChange={(v) => set("categories", v)}
              onReset={() => set("categories", [])}
            />

            <div className="h-px w-full bg-outline-variant/20" />
          </>
        )}

        {/* Garment Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">
              Garment Size
            </h3>
            {filters.sizes.length > 0 && (
              <button
                type="button"
                onClick={() => set("sizes", [])}
                className="text-[11px] font-semibold text-surface-tint hover:underline uppercase tracking-wider cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SIZE_OPTIONS.map((s) => {
              const isSelected = filters.sizes.includes(s);
              const count = counts.sizes[s] ?? 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  title={`${s} (${count} items)`}
                  className={`py-2 text-center rounded-lg font-sans text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary-container text-white font-semibold shadow-sm"
                      : "bg-surface-container-low text-secondary hover:bg-primary-container/10 hover:text-primary"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-outline-variant/20" />

        {/* Curated Hue (Color) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-xs font-bold text-primary uppercase tracking-wider">
              Curated Hue
            </h3>
            {filters.colors.length > 0 && (
              <button
                type="button"
                onClick={() => set("colors", [])}
                className="text-[11px] font-semibold text-surface-tint hover:underline uppercase tracking-wider cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {colorOptions.map((c) => {
              const isSelected = filters.colors.includes(c);
              const count = counts.colors[c] ?? 0;
              const swatchBg = swatchMap[c] || COLOR_SWATCH[c] || "#888888";
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleColor(c)}
                  title={`${c} (${count})`}
                  aria-label={`Filter by ${c}`}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-primary-container ring-offset-2 ring-offset-surface-container-lowest scale-110 shadow-sm"
                      : "ring-1 ring-outline-variant/60 hover:scale-110"
                  }`}
                  style={{ backgroundColor: swatchBg }}
                />
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-outline-variant/20" />

        {/* Price Band */}
        <PriceSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          valueMin={filters.priceMin}
          valueMax={filters.priceMax}
          onChange={({ min, max }) =>
            onChange({ ...filters, priceMin: min, priceMax: max })
          }
        />
      </div>
    </div>
  );
}

