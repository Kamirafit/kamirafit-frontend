"use client";

import { formatPrice } from "@/lib/format";

type OrderFinancialSummaryProps = {
  itemsSubtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  shippingFee?: number;
  totalAmount: number;
  itemCount: number;
};

export default function OrderFinancialSummary({
  itemsSubtotal,
  discountAmount = 0,
  couponCode,
  shippingFee = 0,
  totalAmount,
  itemCount,
}: OrderFinancialSummaryProps) {
  const isFreeShipping = shippingFee === 0;

  return (
    <div className="mt-4 pt-6 bg-surface-container-low/70 rounded-xl p-5 sm:p-6 border border-outline-variant/20">
      <div className="max-w-md ml-auto flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-sm font-sans text-on-surface-variant">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "Item" : "Items"})</span>
          <span className="font-medium text-primary">{formatPrice(itemsSubtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-sm font-sans text-surface-tint">
            <span className="flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V5a2 2 0 012-2z" />
              </svg>
              <span>Coupon {couponCode ? `(${couponCode})` : "Savings"}</span>
            </span>
            <span className="font-semibold text-surface-tint">
              -{formatPrice(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm font-sans text-on-surface-variant">
          <span>Shipping</span>
          {isFreeShipping ? (
            <span className="font-semibold uppercase tracking-wider text-[11px] text-primary bg-surface-container px-2 py-0.5 rounded">
              Complimentary
            </span>
          ) : (
            <span className="font-medium text-primary">{formatPrice(shippingFee)}</span>
          )}
        </div>

        <div className="h-px bg-outline-variant/30 my-1.5" />

        <div className="flex justify-between items-baseline font-display text-xl sm:text-2xl text-primary">
          <span className="font-medium">Total Paid</span>
          <span className="font-bold text-primary">{formatPrice(totalAmount)}</span>
        </div>

        <p className="text-right text-[11px] font-sans text-on-surface-variant/90 leading-tight pt-1">
          Inclusive of all integrated Indian GST • Invoice ready
        </p>
      </div>
    </div>
  );
}
