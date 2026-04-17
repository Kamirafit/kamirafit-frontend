"use client";

import type { Color } from "../types";
import { COLOR_SWATCH } from "../types";

type Props = {
  options: Color[];
  value: Color | null;
  onChange: (color: Color) => void;
};

export default function ColorSelector({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-900">Color</p>
        <p className="text-xs text-neutral-500">
          {value ? `Selected: ${value}` : "Choose a color"}
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
              className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                selected
                  ? "border-neutral-900 ring-2 ring-neutral-900 ring-offset-2"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <span
                className="block h-7 w-7 rounded-full border border-neutral-200"
                style={{ backgroundColor: COLOR_SWATCH[c] }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
