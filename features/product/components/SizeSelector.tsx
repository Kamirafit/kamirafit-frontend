"use client";

import type { Size } from "../types";

type Props = {
  options: Size[];
  value: Size | null;
  onChange: (size: Size) => void;
  error?: boolean;
};

export default function SizeSelector({
  options,
  value,
  onChange,
  error,
}: Props) {
  return (
    <fieldset>
      <div className="flex items-center justify-between">
        <legend className="text-sm font-semibold text-paper">
          Size{" "}
          {value ? (
            <span className="font-normal text-paper-muted">· {value}</span>
          ) : null}
        </legend>
        <button
          type="button"
          className="text-[11px] font-medium uppercase tracking-[0.14em] text-paper-muted underline-offset-2 transition-colors hover:text-gold hover:underline"
        >
          Size guide
        </button>
      </div>
      <div
        role="radiogroup"
        aria-label="Size"
        className="mt-3 flex flex-wrap gap-2"
      >
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt)}
              className={`inline-flex h-11 min-w-[64px] items-center justify-center rounded-full border px-4 text-[13px] font-medium transition-all ${
                selected
                  ? "border-paper bg-paper text-ink"
                  : "border-line-strong bg-ink text-paper hover:border-paper"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-2 text-[12px] text-[#DC2626]" role="alert">
          Please select a size to continue.
        </p>
      ) : null}
    </fieldset>
  );
}
