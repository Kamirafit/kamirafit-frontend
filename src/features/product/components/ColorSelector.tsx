"use client";

import type { Color } from "../types";
import { COLOR_SWATCH } from "../types";
import { useColorSwatchMap } from "@/services/product";

type Props = {
  options: Color[];
  value: Color | null;
  onChange: (color: Color) => void;
};

export default function ColorSelector({ options, value, onChange }: Props) {
  const swatchMap = useColorSwatchMap();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-muted">
          Color
        </p>
        <p className="text-xs text-paper-muted">
          {value ? (
            <span className="text-gold">Selected: {value}</span>
          ) : (
            "Choose a color"
          )}
        </p>
      </div>
      <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-3">
        {options.map((c) => {
          const selected = c === value;
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c}
              title={c}
              onClick={() => onChange(c)}
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${
                selected
                  ? "border-gold ring-2 ring-gold/70 ring-offset-2 ring-offset-ink"
                  : "border-line hover:-translate-y-0.5 hover:border-gold/60"
              }`}
            >
              <span
                className="block h-7 w-7 rounded-full border border-line"
                style={{ backgroundColor: swatchMap[c] || COLOR_SWATCH[c] || "#888888" }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
