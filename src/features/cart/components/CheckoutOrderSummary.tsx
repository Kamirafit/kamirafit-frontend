import { useState } from "react";
import Image from "next/image";
import { COLOR_SWATCH } from "@/features/product/types";
import { useColorSwatchMap } from "@/services/product";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import { formatPrice, type ResolvedCartItem } from "../utils";
import type { CouponValidationResult } from "@/services/order";

type Props = {
  resolved: ResolvedCartItem[];
  subtotal: number;
  delivery: number;
  total: number;
  appliedCoupon?: CouponValidationResult | null;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => void;
  isApplyingCoupon?: boolean;
  couponError?: string | null;
  selectedPincode?: string;
  deliveryZoneLabel?: string;
};

export default function CheckoutOrderSummary({
  resolved,
  subtotal,
  delivery,
  total,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon = false,
  couponError = null,
  selectedPincode,
  deliveryZoneLabel,
}: Props) {
  const swatchMap = useColorSwatchMap();
  const [couponInput, setCouponInput] = useState("");
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
          let imageSrc = getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE);
          if (item.color && product.imageColorMap && product.images) {
            const match = product.images.find(
              (src) => product.imageColorMap?.[src]?.trim().toLowerCase() === item.color?.trim().toLowerCase()
            );
            if (match) imageSrc = getValidImageSrc(match, DEFAULT_PRODUCT_IMAGE);
          }
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
                        style={{ backgroundColor: swatchMap[item.color] || COLOR_SWATCH[item.color] || "#888888" }}
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

      {/* Coupon input & applied state */}
      <div className="border-t border-line pt-4">
        {!appliedCoupon ? (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (couponInput.trim() && onApplyCoupon) {
                onApplyCoupon(couponInput.trim());
              }
            }}
            className="space-y-2"
          >

            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-paper-muted">
              <span>Promo / Coupon Code</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="w-full rounded-xl border border-line bg-ink px-3 py-2 text-xs uppercase tracking-wider font-mono text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!couponInput.trim() || isApplyingCoupon}
                className="rounded-xl border border-gold bg-gold/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isApplyingCoupon ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                ) : (
                  "Apply"
                )}
              </button>
            </div>
            {couponError && (
              <p className="text-[11px] text-red-400 font-medium">
                {couponError}
              </p>
            )}
          </form>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider uppercase text-emerald-300">
                🏷️ {appliedCoupon.code}
              </span>
              <span className="text-[11px] text-emerald-400/80">
                ({appliedCoupon.discountType === "PERCENTAGE" ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCouponInput("");
                if (onRemoveCoupon) onRemoveCoupon();
              }}
              className="text-[11px] font-semibold text-paper-muted hover:text-red-400 transition-colors uppercase tracking-wider underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <dl className="flex flex-col gap-3 border-t border-line pt-5 text-sm text-paper-muted">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd className="font-medium text-paper">{formatPrice(subtotal)}</dd>
        </div>
        {appliedCoupon && appliedCoupon.discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-400">
            <dt className="flex items-center gap-1.5">
              <span>Coupon Discount</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {appliedCoupon.code}
              </span>
            </dt>
            <dd className="font-medium font-mono text-emerald-400">
              - {formatPrice(appliedCoupon.discountAmount)}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="flex flex-col">
            <span>Delivery fee</span>
            {selectedPincode ? (
              <span className="text-[10px] text-paper-muted">
                {deliveryZoneLabel || "By PIN"} ({selectedPincode})
              </span>
            ) : null}
          </dt>
          <dd className="text-right">
            {delivery === 0 ? (
              <div className="flex flex-col items-end">
                <span className="font-semibold text-emerald-400">FREE</span>
                <span className="text-[10px] text-emerald-400/80 font-medium">Orders over ₹999</span>
              </div>
            ) : (
              <span className="font-medium text-paper">{formatPrice(delivery)}</span>
            )}
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
