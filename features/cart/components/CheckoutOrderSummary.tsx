import Image from "next/image";
import { COLOR_SWATCH } from "@/features/product/types";
import { DELIVERY_FEE, formatPrice, type ResolvedCartItem } from "../utils";

type Props = {
  resolved: ResolvedCartItem[];
  subtotal: number;
  delivery: number;
  total: number;
};

export default function CheckoutOrderSummary({
  resolved,
  subtotal,
  delivery,
  total,
}: Props) {
  return (
    <aside className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
      <h2 className="text-lg font-semibold text-neutral-900">Order summary</h2>

      <ul className="flex flex-col divide-y divide-neutral-200">
        {resolved.map((r) => {
          const { item, product, lineTotal } = r;
          return (
            <li
              key={`${item.id}-${item.size ?? "-"}-${item.color ?? "-"}`}
              className="flex gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold text-white">
                  {item.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {product.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                  {item.size ? <span>Size {item.size}</span> : null}
                  {item.color ? (
                    <span className="inline-flex items-center gap-1">
                      <span
                        aria-hidden
                        className="inline-block h-2.5 w-2.5 rounded-full border border-neutral-200"
                        style={{ backgroundColor: COLOR_SWATCH[item.color] }}
                      />
                      {item.color}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="shrink-0 self-center text-sm font-medium text-neutral-900">
                {formatPrice(lineTotal)}
              </p>
            </li>
          );
        })}
      </ul>

      <dl className="flex flex-col gap-3 border-t border-neutral-200 pt-5 text-sm text-neutral-700">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium text-neutral-900">
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Delivery fee</dt>
          <dd className="font-medium text-neutral-900">
            {formatPrice(delivery || DELIVERY_FEE)}
          </dd>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-neutral-200 pt-4 text-base">
          <dt className="font-semibold text-neutral-900">Total</dt>
          <dd className="font-semibold text-neutral-900">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
