"use client";

import { useMemo } from "react";
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
} from "../types";
import CheckboxGroup from "./CheckboxGroup";
import PriceSlider from "./PriceSlider";
import { useColors } from "@/services/product";

type Counts = {
  categories: Record<Category, number>;
  sizes: Record<Size, number>;
  colors: Record<Color, number>;
};

type Props = {
  filters: Filters;
  counts: Counts;
  onChange: (next: Filters) => void;
  onReset: () => void;
  className?: string;
};

export default function FiltersSidebar({
  filters,
  counts,
  onChange,
  onReset,
  className,
}: Props) {
  const { data: apiColors } = useColors();

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

  return (
    <div
      className={`flex flex-col gap-7 rounded-2xl border border-line bg-ink p-5 ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-paper">
          Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-medium text-paper-muted underline-offset-2 transition-colors hover:text-gold hover:underline"
        >
          Reset all
        </button>
      </div>

      <CheckboxGroup<Category>
        legend="Category"
        options={CATEGORY_OPTIONS.map((c) => ({
          value: c,
          label: c,
          count: counts.categories[c] ?? 0,
        }))}
        selected={filters.categories}
        onChange={(v) => set("categories", v)}
        onReset={() => set("categories", [])}
      />

      <div className="h-px w-full bg-line" />

      <CheckboxGroup<Size>
        legend="Size"
        options={SIZE_OPTIONS.map((s) => ({
          value: s,
          label: s,
          count: counts.sizes[s] ?? 0,
        }))}
        selected={filters.sizes}
        onChange={(v) => set("sizes", v)}
        onReset={() => set("sizes", [])}
      />

      <div className="h-px w-full bg-line" />

      <CheckboxGroup<Color>
        legend="Color"
        options={colorOptions.map((c) => ({
          value: c,
          label: c,
          count: counts.colors[c] ?? 0,
        }))}
        selected={filters.colors}
        onChange={(v) => set("colors", v)}
        onReset={() => set("colors", [])}
      />

      <div className="h-px w-full bg-line" />

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
  );
}
