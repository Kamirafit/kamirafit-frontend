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
      className="inline-flex items-center rounded-full border border-line bg-ink-2"
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className="inline-flex h-9 w-9 items-center justify-center rounded-l-full text-lg text-paper-muted transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-paper-muted/30"
      >
        −
      </button>
      <span
        className="min-w-8 text-center text-sm font-semibold tracking-wide text-paper"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={!canIncrement}
        aria-label="Increase quantity"
        className="inline-flex h-9 w-9 items-center justify-center rounded-r-full text-lg text-paper-muted transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-paper-muted/30"
      >
        +
      </button>
    </div>
  );
}
