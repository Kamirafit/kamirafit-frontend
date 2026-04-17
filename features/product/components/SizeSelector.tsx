"use client";

import type { Size } from "../types";

type Props = {
  options: Size[];
  value: Size | null;
  onChange: (size: Size) => void;
  error?: boolean;
};

export default function SizeSelector({ options, value, onChange, error }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-900">Size</p>
        {value ? (
          <p className="text-xs text-neutral-500">Selected: {value}</p>
        ) : (
          <p
            className={`text-xs ${error ? "text-red-600" : "text-neutral-500"}`}
          >
            {error ? "Please select a size" : "Choose a size"}
          </p>
        )}
      </div>
      <div
        role="radiogroup"
        aria-label="Size"
        className="flex flex-wrap gap-2"
      >
        {options.map((s) => {
          const selected = s === value;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(s)}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors ${
                selected
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
