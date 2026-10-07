"use client";

type Props = {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
  disabled?: boolean;
};

export default function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  ariaLabel = "Quantity",
  disabled = false,
}: Props) {
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  const displayValue = value < 10 ? `0${value}` : String(value);

  return (
    <div
      className="inline-flex items-center rounded-full border border-outline-variant/40 bg-surface-container-low p-1 shadow-xs"
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest text-primary transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-35"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>

      <span
        className="w-10 text-center font-mono text-xs sm:text-sm font-bold text-primary select-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {displayValue}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest text-primary transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-35"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
