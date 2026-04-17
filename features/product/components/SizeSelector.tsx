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
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-muted">
          Size
        </p>
        {value ? (
          <p className="text-xs text-gold">Selected: {value}</p>
        ) : (
          <p
            className={`text-xs ${error ? "text-red-400" : "text-paper-muted"}`}
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
              className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-all duration-200 ${
                selected
                  ? "border-gold bg-gold text-ink shadow-[0_10px_25px_-12px_rgba(212,175,55,0.55)]"
                  : "border-line bg-ink-2 text-paper hover:-translate-y-0.5 hover:border-gold hover:text-gold"
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
