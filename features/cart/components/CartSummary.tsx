import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { formatPrice } from "../utils";

type Props = {
  subtotal: number;
  delivery: number;
  total: number;
  itemCount: number;
};

export default function CartSummary({
  subtotal,
  delivery,
  total,
  itemCount,
}: Props) {
  const disabled = itemCount === 0;

  return (
    <aside className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-line bg-ink-2 p-6 shadow-[0_40px_80px_-40px_rgba(74,14,26,0.15)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
      />
      <h2 className="font-display text-lg font-semibold tracking-wide text-paper">
        Order summary
      </h2>

      <dl className="flex flex-col gap-3 text-sm text-paper-muted">
        <div className="flex items-center justify-between">
          <dt>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="font-medium text-paper">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Delivery fee</dt>
          <dd className="font-medium text-paper">
            {disabled ? "—" : formatPrice(delivery)}
          </dd>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-line pt-4 text-base">
          <dt className="font-display font-semibold text-paper">Total</dt>
          <dd className="font-display text-lg font-semibold tracking-wide text-gold">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>

      <Link
        href="/checkout"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
        className={buttonClasses(
          "primary",
          "md",
          disabled
            ? "cursor-not-allowed !bg-gold-dim !text-paper/60 hover:!bg-gold-dim hover:!translate-y-0 hover:!shadow-none"
            : "",
        )}
      >
        Proceed to Checkout
      </Link>

      <p className="text-xs text-paper-muted/80">
        Taxes calculated at checkout. Free exchanges within 7 days.
      </p>
    </aside>
  );
}
