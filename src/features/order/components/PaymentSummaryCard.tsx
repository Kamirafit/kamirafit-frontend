"use client";

import { formatPrice } from "@/lib/format";

type PaymentSummaryCardProps = {
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  transactionRef?: string | null;
  onDownloadInvoice?: () => void;
  isDownloadingInvoice?: boolean;
};

export default function PaymentSummaryCard({
  totalAmount,
  paymentMethod = "ONLINE",
  paymentStatus = "COMPLETED",
  orderStatus = "Confirmed",
  transactionRef,
  onDownloadInvoice,
  isDownloadingInvoice = false,
}: PaymentSummaryCardProps) {
  const normMethod = (paymentMethod || "").toUpperCase();
  const isCod = normMethod.includes("COD") || normMethod.includes("CASH");
  const isPaid = paymentStatus?.toUpperCase() === "PAID" || paymentStatus?.toUpperCase() === "COMPLETED";

  const normStatus = (orderStatus || "").toUpperCase();
  const isDeliveredOrPost = [
    "DELIVERED",
    "RETURN_REQUESTED",
    "RETURN_APPROVED",
    "RETURN_REJECTED",
    "RETURNED",
    "REFUNDED",
  ].includes(normStatus);

  const methodLabel = isCod
    ? "Cash on Delivery (COD)"
    : normMethod.includes("UPI")
    ? "Paid via UPI"
    : "Online Payment (Razorpay)";

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between border border-outline-variant/30 transition-all hover:shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-4 text-surface-tint">
          <svg className="w-5 h-5 text-surface-tint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-surface-tint">
            Payment Summary
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl text-primary mb-2 font-medium">
          {formatPrice(totalAmount)}{" "}
          <span className="text-base sm:text-lg font-normal text-on-surface-variant">
            {isCod ? "Due on Delivery" : isPaid ? "Total Paid" : "Payment Pending"}
          </span>
        </h3>

        <div className="font-sans text-sm text-on-surface-variant leading-relaxed space-y-1.5 mt-3">
          <p>
            Method: <span className="font-medium text-primary">{methodLabel}</span>
          </p>

          <p className="flex items-center gap-2">
            Status:{" "}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                isPaid
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : isCod
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-surface-container text-on-surface-variant border border-outline-variant/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPaid ? "bg-emerald-600" : isCod ? "bg-amber-600" : "bg-outline"
                }`}
              />
              {isPaid ? "Paid" : isCod ? "Pay on Delivery" : paymentStatus}
            </span>
          </p>

          {transactionRef && (
            <p className="text-xs break-all pt-0.5">
              Ref:{" "}
              <span className="font-mono text-[11px] text-primary bg-surface-container px-2 py-0.5 rounded">
                {transactionRef}
              </span>
            </p>
          )}
        </div>
      </div>

      {isDeliveredOrPost && onDownloadInvoice ? (
        <div className="pt-5 mt-6 bg-surface-container-low/60 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-3.5 rounded-b-2xl border-t border-outline-variant/20 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">GST Tax Invoice</span>
          <button
            type="button"
            onClick={onDownloadInvoice}
            disabled={isDownloadingInvoice}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-surface-tint transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDownloadingInvoice ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-surface-tint" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-surface-tint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Invoice (PDF)</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="pt-5 mt-6 bg-surface-container-low/60 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-3.5 rounded-b-2xl border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="text-on-surface font-medium">GST Tax Invoice</span>
          <span className="text-[11px] text-on-surface-variant/80 italic">
            Available once delivered
          </span>
        </div>
      )}
    </div>
  );
}
