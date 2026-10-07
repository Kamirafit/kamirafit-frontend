"use client";

import { FREE_SHIPPING_THRESHOLD, formatPrice } from "../utils";

type Props = {
  subtotal: number;
};

export default function FreeShippingBanner({ subtotal }: Props) {
  if (subtotal <= 0) return null;

  const isUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="mb-6 rounded-2xl border border-outline-variant/30 bg-surface-container-low/70 p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
              isUnlocked
                ? "border-emerald-600/30 bg-emerald-50 text-emerald-700"
                : "border-outline-variant/50 bg-surface-container-lowest text-primary"
            }`}
          >
            {isUnlocked ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v10H3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4l3 3v4h-7" />
                <circle cx="7" cy="18" r="1.8" />
                <circle cx="17" cy="18" r="1.8" />
              </svg>
            )}
          </div>

          <div>
            <p className="text-xs sm:text-sm font-medium text-primary">
              {isUnlocked ? (
                <>
                  <span className="font-semibold text-emerald-800">Complimentary Shipping Unlocked!</span> Your order qualifies for free standard delivery across India.
                </>
              ) : (
                <>
                  Add <strong className="font-bold text-primary font-mono">{formatPrice(remaining)}</strong> more to qualify for <strong className="font-semibold text-primary">Free Standard Delivery</strong>
                </>
              )}
            </p>
            <p className="text-[11px] text-outline mt-0.5">
              Standard delivery threshold: {formatPrice(FREE_SHIPPING_THRESHOLD)} (Domestic orders)
            </p>
          </div>
        </div>

        <span className="self-end sm:self-auto font-mono text-[11px] font-semibold text-primary shrink-0">
          {percentage}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-high/90">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isUnlocked ? "bg-emerald-700" : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
