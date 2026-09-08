import Image from "next/image";
import { COLOR_SWATCH } from "@/features/product/types";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import { formatPrice, type ResolvedCartItem } from "../utils";

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
    <aside className="relative flex flex-col gap-6 overflow-hidden rounded-2xl border border-line bg-ink-2 p-6 shadow-[0_40px_80px_-40px_rgba(74,14,26,0.15)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
      />
      <h2 className="font-display text-lg font-semibold tracking-wide text-paper">
        Order summary
      </h2>

      <ul className="flex flex-col divide-y divide-line">
        {resolved.map((r) => {
          const { item, product, lineTotal } = r;
          const imageSrc = getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE);
          return (
            <li
              key={`${item.id}-${item.size ?? "-"}-${item.color ?? "-"}`}
              className="flex gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-ink">
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-ink shadow-[0_0_0_2px_var(--color-ink-2)]">
                  {item.quantity}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <p className="truncate font-display text-sm font-medium text-paper">
                  {product.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-paper-muted">
                  {item.size ? <span>Size {item.size}</span> : null}
                  {item.color ? (
                    <span className="inline-flex items-center gap-1">
                      <span
                        aria-hidden
                        className="inline-block h-2.5 w-2.5 rounded-full border border-line"
                        style={{ backgroundColor: COLOR_SWATCH[item.color] }}
                      />
                      {item.color}
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="shrink-0 self-center font-display text-sm font-semibold text-gold">
                {formatPrice(lineTotal)}
              </p>
            </li>
          );
        })}
      </ul>

      <dl className="flex flex-col gap-3 border-t border-line pt-5 text-sm text-paper-muted">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium text-paper">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Delivery fee</dt>
          <dd className="font-medium text-paper">
            {delivery === 0 ? "FREE" : formatPrice(delivery)}
          </dd>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-line pt-4 text-base">
          <dt className="font-display font-semibold text-paper">Total</dt>
          <dd className="font-display text-lg font-semibold tracking-wide text-gold">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
