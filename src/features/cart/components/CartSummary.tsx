"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "../utils";
import type { CouponValidationResult } from "@/services/order";

type Props = {
  subtotal: number;
  delivery: number;
  total: number;
  itemCount: number;
  totalSavings?: number;
  appliedCoupon?: CouponValidationResult | null;
  onApplyCoupon?: (code: string) => Promise<void>;
  onRemoveCoupon?: () => void;
  isApplyingCoupon?: boolean;
  couponError?: string | null;
};

export default function CartSummary({
  subtotal,
  delivery,
  total,
  itemCount,
  totalSavings = 0,
  appliedCoupon = null,
  onApplyCoupon,
  onRemoveCoupon,
  isApplyingCoupon = false,
  couponError = null,
}: Props) {
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const disabled = itemCount === 0;

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim() || !onApplyCoupon || isApplyingCoupon) return;
    await onApplyCoupon(couponCodeInput.trim());
  };

  return (
    <aside className="sticky top-28 space-y-4">
      {/* Main Order Summary Card */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 sm:p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-outline-variant/30 pb-3">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-primary">
            Order Summary
          </h2>
          <span className="font-mono text-outline text-xs font-semibold tracking-wider">
            {itemCount} {itemCount === 1 ? "PIECE" : "PIECES"}
          </span>
        </div>

        {/* Calculations Breakdown */}
        <div className="py-4 space-y-3 text-xs sm:text-sm text-on-surface-variant border-b border-outline-variant/20 font-sans">
          <div className="flex justify-between items-center">
            <span>Atelier Subtotal</span>
            <span className="font-medium text-primary">{formatPrice(subtotal)}</span>
          </div>

          {appliedCoupon && appliedCoupon.discountAmount > 0 && (
            <div className="flex justify-between items-center text-surface-tint">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Promotional Discount
              </span>
              <span className="font-semibold font-mono">
                - {formatPrice(appliedCoupon.discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span>Carbon-Neutral Courier</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            </div>
            <div className="text-right">
              {disabled ? (
                <span>—</span>
              ) : delivery === 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="line-through text-outline text-xs">₹199</span>
                  <span className="font-semibold text-emerald-800 uppercase text-xs tracking-wider">
                    Free
                  </span>
                </div>
              ) : (
                <span className="font-medium text-primary">{formatPrice(delivery)}</span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-outline">Goods &amp; Services Tax (GST)</span>
            <span className="text-outline">Included</span>
          </div>
        </div>

        {/* Voucher / Coupon Code Module */}
        <div className="py-4 space-y-2.5">
          <label
            htmlFor="cart-coupon-input"
            className="block text-[11px] font-semibold uppercase tracking-wider text-outline"
          >
            Promotional Voucher Code
          </label>

          {!appliedCoupon ? (
            <form onSubmit={handleCouponSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    aria-label="Promotional voucher code"
                    className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-low px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider text-primary placeholder:text-outline focus:border-primary-container focus:bg-surface-container-lowest focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!couponCodeInput.trim() || isApplyingCoupon || disabled}
                  className="rounded-lg bg-surface-container-high px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-surface-container transition-colors disabled:cursor-not-allowed disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {isApplyingCoupon ? (
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>

              {couponError && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-red-700 mt-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
                  {couponError}
                </p>
              )}
            </form>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-secondary-fixed bg-secondary-container/40 p-2.5 text-primary">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div className="truncate">
                  <span className="font-mono text-xs font-bold">{appliedCoupon.code}</span>
                  <span className="text-[11px] text-on-surface-variant ml-1.5">
                    • {formatPrice(appliedCoupon.discountAmount)} discount applied
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCouponCodeInput("");
                  if (onRemoveCoupon) onRemoveCoupon();
                }}
                aria-label="Remove coupon"
                className="text-on-surface-variant hover:text-red-700 transition-colors p-1 cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Total Calculation Section */}
        <div className="border-t border-outline-variant/30 pt-4 pb-5">
          <div className="flex items-baseline justify-between mb-1">
            <div>
              <span className="font-serif text-lg sm:text-xl font-medium text-primary">
                Estimated Total
              </span>
              <p className="text-[11px] text-outline font-sans">
                Includes all applicable taxes
              </p>
            </div>
            <div className="text-right">
              <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-primary">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          {totalSavings > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-container-low/80 p-2.5 text-surface-tint text-xs">
              <svg className="h-4 w-4 shrink-0 text-surface-tint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                You are saving <strong className="font-bold">{formatPrice(totalSavings)}</strong> on this atelier order today
              </span>
            </div>
          )}
        </div>

        {/* Checkout CTA Button */}
        <Link
          href="/checkout"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={(e) => {
            if (disabled) e.preventDefault();
          }}
          className={`group flex w-full items-center justify-center gap-3 rounded-full py-4 px-6 font-sans text-xs uppercase tracking-[0.14em] font-semibold text-white shadow-md transition-all duration-200 ${
            disabled
              ? "cursor-not-allowed bg-outline opacity-60"
              : "bg-primary-container hover:bg-primary hover:shadow-lg"
          }`}
        >
          <span>Proceed to Checkout</span>
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>

      {/* Trust & Guarantee Panel */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 sm:p-5 space-y-3.5">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 shrink-0 text-surface-tint mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <div>
            <p className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
              256-Bit SSL Encrypted Checkout
            </p>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
              Bank-grade tokenized transaction safety via verified payment gateways.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 shrink-0 text-surface-tint mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <div>
            <p className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
              7-Day Hassle-Free Returns &amp; Exchanges
            </p>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
              Complimentary doorstep reverse pickup available across India.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 shrink-0 text-surface-tint mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <div>
            <p className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
              100% Authentic Handcrafted Quality
            </p>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
              Original atelier pieces cut and sewn with precision.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
