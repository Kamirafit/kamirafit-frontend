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
    <aside className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      <h2 className="text-lg font-semibold text-neutral-900">Order summary</h2>

      <dl className="flex flex-col gap-3 text-sm text-neutral-700">
        <div className="flex items-center justify-between">
          <dt>
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="font-medium text-neutral-900">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Delivery fee</dt>
          <dd className="font-medium text-neutral-900">
            {disabled ? "—" : formatPrice(delivery)}
          </dd>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-4 text-base">
          <dt className="font-semibold text-neutral-900">Total</dt>
          <dd className="font-semibold text-neutral-900">
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
          disabled ? "cursor-not-allowed !bg-neutral-300 hover:!bg-neutral-300" : "",
        )}
      >
        Proceed to Checkout
      </Link>

      <p className="text-xs text-neutral-500">
        Taxes calculated at checkout. Free exchanges within 7 days.
      </p>
    </aside>
  );
}
