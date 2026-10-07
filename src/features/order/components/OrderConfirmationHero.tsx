"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";

type OrderConfirmationHeroProps = {
  customerName?: string;
  orderNumber?: string;
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  orderDate?: string;
  totalAmount?: number;
};

export default function OrderConfirmationHero({
  customerName,
  orderNumber,
  orderStatus = "Confirmed",
  paymentMethod = "ONLINE",
  paymentStatus,
  orderDate,
  totalAmount,
}: OrderConfirmationHeroProps) {
  const firstName = customerName ? customerName.trim().split(" ")[0] : "";
  const normMethod = (paymentMethod || "").toUpperCase();
  const isCod = normMethod.includes("COD") || normMethod.includes("CASH");

  const isPaymentFailed = !isCod && paymentStatus?.toUpperCase() === "FAILED";
  const isOnlinePaymentPending = !isCod && paymentStatus?.toUpperCase() === "PENDING";

  const formattedDate = orderDate
    ? new Date(orderDate).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-10 md:p-14 text-center flex flex-col items-center relative overflow-hidden border border-outline-variant/30">
      {/* Top burgundy/rose gradient bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-container via-surface-tint to-primary" />

      {/* Circular Badge */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center shadow-md">
          <div className="w-16 h-16 rounded-full bg-surface-container-lowest/10 flex items-center justify-center">
            {isPaymentFailed ? (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : isOnlinePaymentPending ? (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Fine Accent Seal Pin */}
        <div
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center border border-outline-variant/40"
          title="KamiraFit Studio Assurance"
        >
          <svg className="w-4 h-4 text-surface-tint fill-current" viewBox="0 0 24 24">
            <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
          </svg>
        </div>
      </div>

      {/* Eyebrow Label */}
      <span className="font-sans text-[11px] sm:text-xs font-semibold uppercase text-surface-tint tracking-[0.2em] mb-3">
        {isPaymentFailed
          ? "Payment Attention Required"
          : isOnlinePaymentPending
          ? "Payment Verification Pending"
          : "Order Received with Gratitude"}
      </span>

      {/* Main Editorial Serif Heading */}
      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight max-w-2xl mb-4 font-normal leading-tight">
        {isPaymentFailed ? (
          "Payment Unsuccessful"
        ) : firstName ? (
          <>
            Thank You, {firstName}.<br className="hidden sm:inline" /> Your Order is Placed.
          </>
        ) : (
          <>
            Thank You.<br className="hidden sm:inline" /> Your Order is Placed.
          </>
        )}
      </h1>

      {/* Description tailored for COD vs Online vs Pending */}
      <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-lg mb-6 leading-relaxed">
        {isPaymentFailed ? (
          "We could not verify payment for your order. If money was debited from your bank account, please contact support or retry."
        ) : isCod ? (
          totalAmount ? (
            <>
              Your Cash on Delivery order is confirmed. Please keep{" "}
              <span className="font-semibold text-primary">{formatPrice(totalAmount)}</span> ready to pay the courier partner in cash or UPI upon delivery.
            </>
          ) : (
            "Your Cash on Delivery order is confirmed. Please keep the exact amount ready to pay the courier partner upon delivery."
          )
        ) : isOnlinePaymentPending ? (
          "Your order has been recorded. Our system is awaiting payment confirmation from your bank or UPI gateway."
        ) : (
          "We’ve sent a confirmation receipt to your email. We are now carefully preparing your order for dispatch."
        )}
      </p>

      {/* Primary & Secondary Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mt-2">
        <Link
          href="/shop"
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-xs font-sans uppercase tracking-wider font-semibold hover:bg-primary-container transition-all shadow-sm group"
        >
          <span>Continue Shopping</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        <Link
          href="/account/orders"
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-primary text-primary hover:bg-primary/5 transition-all text-xs font-sans uppercase tracking-wider font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>View Your Orders</span>
        </Link>
      </div>

      {/* Meta Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-8 pt-6 border-t border-outline-variant/20 w-full max-w-xl text-xs text-on-surface-variant">
        {orderNumber && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 font-mono text-[11px] text-primary">
            <span className="text-surface-tint font-bold">#</span>
            {orderNumber}
          </span>
        )}
        {orderStatus && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-[11px] font-medium text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-surface-tint" />
            {orderStatus}
          </span>
        )}
        {isCod && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-medium">
            Cash on Delivery
          </span>
        )}
        {formattedDate && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-[11px] text-on-surface-variant font-medium">
            {formattedDate}
          </span>
        )}
      </div>
    </section>
  );
}
