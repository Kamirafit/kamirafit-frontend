"use client";

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

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
};

export default function FiltersSidebar({ filters, onChange, onReset }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
        >
          Reset all
        </button>
      </div>

      <CheckboxGroup<Category>
        legend="Category"
        options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
        selected={filters.categories}
        onChange={(v) => set("categories", v)}
      />

      <CheckboxGroup<Size>
        legend="Size"
        options={SIZE_OPTIONS.map((s) => ({ value: s, label: s }))}
        selected={filters.sizes}
        onChange={(v) => set("sizes", v)}
      />

      <CheckboxGroup<Color>
        legend="Color"
        options={COLOR_OPTIONS.map((c) => ({ value: c, label: c }))}
        selected={filters.colors}
        onChange={(v) => set("colors", v)}
      />

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
