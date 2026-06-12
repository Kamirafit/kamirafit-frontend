"use client";

import { useId } from "react";

type Props = {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  onChange: (next: { min: number; max: number }) => void;
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PriceSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 50,
  onChange,
}: Props) {
  const minId = useId();
  const maxId = useId();

  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  const handleMin = (v: number) => {
    const next = Math.min(v, valueMax - step);
    onChange({ min: next, max: valueMax });
  };

  const handleMax = (v: number) => {
    const next = Math.max(v, valueMin + step);
    onChange({ min: valueMin, max: next });
  };

  const thumb =
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:shadow-[0_0_0_3px_rgba(139,30,45,0.25)] [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(139,30,45,0.25)]";

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-muted">
        Price
      </p>
      <div className="mt-3 flex items-center justify-between text-sm text-paper">
        <span>{formatINR(valueMin)}</span>
        <span>{formatINR(valueMax)}</span>
      </div>

      <div className="relative mt-3 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink-4" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gold"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <label htmlFor={minId} className="sr-only">
          Minimum price
        </label>
        <input
          id={minId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => handleMin(Number(e.target.value))}
          className={`pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent ${thumb}`}
        />
        <label htmlFor={maxId} className="sr-only">
          Maximum price
        </label>
        <input
          id={maxId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => handleMax(Number(e.target.value))}
          className={`pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent ${thumb}`}
        />
      </div>
    </div>
  );
}
