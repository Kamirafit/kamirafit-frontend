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

  if (!options || options.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs uppercase tracking-wider text-primary font-bold">
          Palette
        </span>
        <span className="font-sans text-xs text-on-surface-variant font-medium">
          {value || "Select Hue"}
        </span>
      </div>

      <div role="radiogroup" aria-label="Palette selection" className="flex items-center gap-3 flex-wrap">
        {options.map((c) => {
          const selected = c === value;
          const bg = swatchMap[c] || COLOR_SWATCH[c] || "#888888";

          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Color option ${c}`}
              title={c}
              onClick={() => onChange(c)}
              className={`w-9 h-9 rounded-full ring-offset-2 ring-offset-surface transition-transform hover:scale-105 cursor-pointer flex items-center justify-center p-0.5 ${
                selected
                  ? "ring-2 ring-primary-container scale-105 shadow-sm"
                  : "ring-0 hover:ring-2 hover:ring-outline-variant"
              }`}
            >
              <span
                className="w-full h-full rounded-full border border-black/10 shadow-inner"
                style={{ backgroundColor: bg }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
