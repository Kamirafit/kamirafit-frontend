"use client";

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
};

export default function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
}: Props) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div
      className="inline-flex items-center rounded-full border border-neutral-300 bg-white"
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className="inline-flex h-9 w-9 items-center justify-center rounded-l-full text-lg text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        −
      </button>
      <span
        className="min-w-8 text-center text-sm font-medium text-neutral-900"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className="inline-flex h-9 w-9 items-center justify-center rounded-r-full text-lg text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        +
      </button>
    </div>
  );
}
