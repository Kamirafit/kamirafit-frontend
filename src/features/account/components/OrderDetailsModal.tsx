"use client";

import { useState } from "react";
import Image from "next/image";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import { Order } from "../types";
import { formatPrice } from "@/lib/format";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTrackingModal from "./OrderTrackingModal";
import OrderJourneyTimeline from "./OrderJourneyTimeline";
import { useCancelOrder, useRequestReturn, orderService } from "@/services/order";

type Props = {
  order: Order;
  onClose: () => void;
};

export default function OrderDetailsModal({ order, onClose }: Props) {
  const [showTracking, setShowTracking] = useState(false);
  const cancelOrderMutation = useCancelOrder();
  const requestReturnMutation = useRequestReturn();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Changed mind / Ordered by mistake");
  const [cancelOtherText, setCancelOtherText] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("Wrong size / fit issue");
  const [returnOtherText, setReturnOtherText] = useState("");
  const [returnComments, setReturnComments] = useState("");
  const [returnError, setReturnError] = useState<string | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  // Helper to count letters excluding spaces, numbers, and special characters
  const countLetters = (str: string) => (str.match(/[a-zA-Z]/g) || []).length;

  const isCancelOther = cancelReason === "Other" || cancelReason === "Other reasons";
  const cancelLetterCount = countLetters(cancelOtherText);
  const isCancelValid = !isCancelOther || cancelLetterCount >= 10;

  const isReturnOther = returnReason === "Other";
  const returnLetterCount = countLetters(returnOtherText);
  const isReturnValid = !isReturnOther || returnLetterCount >= 10;

  const customOrder = order as {
    createdAt?: string;
    updatedAt?: string;
    orderNumber?: string;
    paymentStatus?: string;
    shippingFee?: number;
    couponCode?: string;
    coupon?: {
      code: string;
      discountType?: string;
      discountValue?: number;
      description?: string | null;
    } | null;
  } & Order;

  const normStatus = (order.status || "").toUpperCase();
  // Customer can cancel up until Shiprocket has picked up the product
  const isCancellable =
    normStatus === "CONFIRMED" ||
    normStatus === "PROCESSING" ||
    normStatus === "PACKED" ||
    normStatus === "PENDING_VERIFICATION" ||
    normStatus === "PENDING VERIFICATION";

  // Return only allowed within 7 days of delivery
  const deliveryDate = customOrder.updatedAt || customOrder.createdAt;
  const daysSinceDelivery = deliveryDate
    ? Math.floor((Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isWithin7Days = daysSinceDelivery <= 7;
  const isReturnable = normStatus === "DELIVERED" && isWithin7Days;

  // Invoice only available post-delivery
  const isDeliveredOrPost = [
    "DELIVERED",
    "RETURN_REQUESTED",
    "RETURN_APPROVED",
    "RETURN_REJECTED",
    "RETURNED",
    "REFUNDED",
  ].includes(normStatus);

  // Track package is only needed for active forward shipments
  const isTerminalOrReturned =
    normStatus === "CANCELLED" ||
    normStatus === "CANCELED" ||
    normStatus === "DELIVERED" ||
    normStatus.includes("RETURN") ||
    normStatus.includes("REFUND");
  const canTrackPackage = !isTerminalOrReturned;

  // Accurate breakdown of items subtotal, shipping, discount, and total
  const itemsSubtotal = (order.items || []).reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0
  );
  const totalAmount = Number(order.totalAmount) || 0;
  let shippingFee = 0;
  if (customOrder.shippingFee !== undefined && customOrder.shippingFee !== null) {
    shippingFee = Number(customOrder.shippingFee);
  } else if (totalAmount > itemsSubtotal) {
    shippingFee = totalAmount - itemsSubtotal;
  } else if (itemsSubtotal > 0 && itemsSubtotal < 999) {
    shippingFee = 50;
  }
  const discountAmount = Math.max(0, itemsSubtotal + shippingFee - totalAmount);
  const couponCode = customOrder.coupon?.code || customOrder.couponCode;

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError(null);

    if (isCancelOther && cancelLetterCount < 10) {
      setCancelError(
        "Please enter at least 10 letters describing your reason (excluding spaces, numbers and special characters)."
      );
      return;
    }

    const finalReason = isCancelOther
      ? `Other: ${cancelOtherText.trim()}`
      : cancelReason;

    try {
      await cancelOrderMutation.mutateAsync({ id: order.id, reason: finalReason });
      setActionSuccess("Order cancelled successfully.");
      setCancelOpen(false);
      setCancelOtherText("");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setCancelError(errorObj?.response?.data?.message || errorObj?.message || "Failed to cancel order.");
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnError(null);

    if (isReturnOther && returnLetterCount < 10) {
      setReturnError(
        "Please enter at least 10 letters describing your reason (excluding spaces, numbers and special characters)."
      );
      return;
    }

    const finalReason = isReturnOther
      ? `Other: ${returnOtherText.trim()}`
      : returnReason;

    const finalComments = isReturnOther
      ? returnOtherText.trim()
      : returnComments.trim();

    try {
      await requestReturnMutation.mutateAsync({
        id: order.id,
        reason: finalReason,
        comments: finalComments || undefined,
      });
      setActionSuccess("Return request submitted successfully. Our team will review it.");
      setReturnOpen(false);
      setReturnOtherText("");
      setReturnComments("");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setReturnError(errorObj?.response?.data?.message || errorObj?.message || "Failed to submit return request.");
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      setInvoiceError(null);
      const res = await orderService.downloadInvoice(order.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${orderNum}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setInvoiceError(
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to download tax invoice. Please try again."
      );
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const dateValue = customOrder.createdAt || order.date;
  const dateStr = dateValue
    ? new Date(dateValue).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent";

  const orderNum = customOrder.orderNumber || order.id;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden modal-scrollbar-hidden rounded-2xl border border-line bg-ink shadow-2xl backdrop-blur-xl">
        <div className="sticky top-0 z-30 border-b border-line bg-ink px-6 py-4 backdrop-blur-md flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-bold text-paper">
              Order Details
            </h2>
            <p className="text-sm text-paper-muted">{orderNum} • {dateStr}</p>
          </div>
          <button onClick={onClose} className="text-paper-muted hover:text-paper">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {actionSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-400">
              {actionSuccess}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted">
                Order Status
              </h3>
              <OrderStatusBadge status={order.status} size="lg" />
            </div>

            {/* Visual Product Journey Stepper */}
            <OrderJourneyTimeline
              order={order}
              variant="detailed"
              onTrackShipment={order.trackingNumber && canTrackPackage ? () => setShowTracking(true) : undefined}
            />

            <div className="flex flex-wrap items-center gap-3">
              {order.trackingNumber && canTrackPackage && (
                <div className="flex flex-1 items-center justify-between gap-4 rounded-xl border border-line bg-ink-2/40 p-3">
                  <p className="text-sm text-paper">
                    <span className="text-paper-muted">Tracking ID: </span>
                    <span className="font-mono font-medium text-gold">{order.trackingNumber}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowTracking(true)}
                    className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-ink transition-colors"
                  >
                    Track Shipment
                  </button>
                </div>
              )}

              {isCancellable && (
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500 hover:text-white"
                >
                  Cancel Order
                </button>
              )}

              {isReturnable && (
                <button
                  type="button"
                  onClick={() => setReturnOpen(true)}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500 hover:text-ink"
                >
                  Request Return / Refund (7-Day Window)
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted border-b border-line pb-2">
              Items Ordered
            </h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item, index) => {
                const imageSrc = getValidImageSrc(item.productImage, DEFAULT_PRODUCT_IMAGE);
                return (
                  <div key={index} className="flex gap-4">
                    <div className="relative h-20 w-16 overflow-hidden rounded-md border border-line bg-ink-2 shrink-0">
                      <Image src={imageSrc} alt={item.productName} fill className="object-cover" />
                    </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="font-display text-[15px] font-medium text-paper">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-paper-muted">
                      Qty: {item.quantity} • Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-paper">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted border-b border-line pb-2">
                Shipping Address
              </h3>
              <div className="text-sm leading-relaxed text-paper">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                <p className="mt-1 text-paper-muted">Phone: {order.shippingAddress.phoneNumber}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted border-b border-line pb-2">
                Order Summary
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-paper-muted">
                  <span>Items Subtotal</span>
                  <span className="font-medium text-paper">{formatPrice(itemsSubtotal)}</span>
                </div>
                {(discountAmount > 0 || couponCode) && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <span>Coupon Discount</span>
                      {couponCode && (
                        <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-mono font-semibold uppercase text-emerald-300">
                          {couponCode}
                        </span>
                      )}
                    </span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-paper-muted">
                  <span>Shipping Fee</span>
                  <span className={shippingFee > 0 ? "font-medium text-paper" : "font-medium text-emerald-400"}>
                    {shippingFee > 0 ? formatPrice(shippingFee) : "Free"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line pt-2.5 font-medium text-paper text-[15px]">
                  <span>Total Amount</span>
                  <span className="font-bold text-gold">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-[12px] text-paper-muted">
                  <span>Payment Method</span>
                  <span className="font-medium text-paper">{order.paymentMethod}</span>
                </div>
                <p className="pt-0.5 text-[11px] text-paper-muted/80">
                  * All product prices are inclusive of applicable GST taxes.
                </p>
                <div className="pt-3 space-y-2">
                  {invoiceError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-center text-xs text-red-400">
                      {invoiceError}
                    </div>
                  )}
                  {isDeliveredOrPost ? (
                    <button
                      type="button"
                      onClick={handleDownloadInvoice}
                      disabled={downloadingInvoice}
                      className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-ink transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                    >
                      <svg
                        className={`h-4 w-4 ${downloadingInvoice ? "animate-spin" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {downloadingInvoice ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        )}
                      </svg>
                      {downloadingInvoice ? "Generating Invoice PDF..." : "Download Tax Invoice (PDF)"}
                    </button>
                  ) : (
                    <div className="rounded-xl border border-line/60 bg-ink-2/30 p-3 text-center">
                      <p className="text-[11px] text-paper-muted flex items-center justify-center gap-1.5">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tax invoice will be available for download once delivered.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showTracking && (
        <OrderTrackingModal
          orderId={order.id}
          orderNumber={orderNum}
          onClose={() => setShowTracking(false)}
        />
      )}

      {/* Cancel Order Dialog */}
      {cancelOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-ink p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-paper">Cancel Order</h3>
              <button onClick={() => setCancelOpen(false)} className="text-paper-muted hover:text-paper">✕</button>
            </div>
            <p className="text-xs text-paper-muted leading-relaxed">
              Are you sure you want to cancel order <strong className="text-paper">{orderNum}</strong>?
              {customOrder.paymentStatus === "Paid" || customOrder.paymentStatus === "COMPLETED"
                ? " Since your payment was completed, a refund will be initiated to your original payment method."
                : ""}
            </p>
            {cancelError && (
              <p className="text-xs text-red-400">{cancelError}</p>
            )}
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-paper-muted mb-1.5">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (cancelError) setCancelError(null);
                  }}
                  className="w-full rounded-xl border border-line bg-ink-2 px-3 py-2 text-xs text-paper focus:border-gold focus:outline-none"
                >
                  <option value="Changed mind / Ordered by mistake">Changed mind / Ordered by mistake</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Estimated delivery time is too long">Estimated delivery time is too long</option>
                  <option value="Need to change shipping address or items">Need to change shipping address or items</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {isCancelOther && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-paper-muted">
                      Reason Description <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-paper-muted">
                      (At least 10 letters required)
                    </span>
                  </div>
                  <textarea
                    value={cancelOtherText}
                    onChange={(e) => {
                      setCancelOtherText(e.target.value);
                      if (cancelError) setCancelError(null);
                    }}
                    rows={3}
                    placeholder="Please explain your reason for cancellation in detail..."
                    className={`w-full rounded-xl border p-3 text-xs text-paper placeholder-paper-muted/50 bg-ink-2 focus:outline-none transition-colors ${
                      cancelLetterCount >= 10
                        ? "border-emerald-500/50 focus:border-emerald-500"
                        : cancelOtherText.length > 0
                        ? "border-amber-500/50 focus:border-amber-500"
                        : "border-line focus:border-gold"
                    }`}
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={
                        cancelLetterCount >= 10
                          ? "text-emerald-400 font-medium"
                          : cancelOtherText.length > 0
                          ? "text-amber-400 font-medium"
                          : "text-paper-muted"
                      }
                    >
                      {cancelLetterCount >= 10
                        ? `✓ Valid (${cancelLetterCount} letters entered)`
                        : `${cancelLetterCount}/10 letters entered (excluding numbers & symbols)`}
                    </span>
                    {cancelLetterCount < 10 && (
                      <span className="text-[10.5px] text-paper-muted">
                        {10 - cancelLetterCount} more letter{10 - cancelLetterCount === 1 ? "" : "s"} needed
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-paper hover:bg-ink-2"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelOrderMutation.isPending || !isCancelValid}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {cancelOrderMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Request Dialog */}
      {returnOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-ink p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-paper">Request Return & Refund</h3>
              <button onClick={() => setReturnOpen(false)} className="text-paper-muted hover:text-paper">✕</button>
            </div>
            <p className="text-xs text-paper-muted leading-relaxed">
              Items can be returned within 7 days of delivery. Once verified, your refund will be processed.
            </p>
            {returnError && (
              <p className="text-xs text-red-400">{returnError}</p>
            )}
            <form onSubmit={handleReturnSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-paper-muted mb-1.5">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => {
                    setReturnReason(e.target.value);
                    if (returnError) setReturnError(null);
                  }}
                  className="w-full rounded-xl border border-line bg-ink-2 px-3 py-2 text-xs text-paper focus:border-gold focus:outline-none"
                >
                  <option value="Wrong size / fit issue">Wrong size / fit issue</option>
                  <option value="Defective or damaged piece">Defective or damaged piece</option>
                  <option value="Color or quality not as expected">Color or quality not as expected</option>
                  <option value="Received incorrect item">Received incorrect item</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {isReturnOther ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-paper-muted">
                      Reason Description <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-paper-muted">
                      (At least 10 letters required)
                    </span>
                  </div>
                  <textarea
                    value={returnOtherText}
                    onChange={(e) => {
                      setReturnOtherText(e.target.value);
                      if (returnError) setReturnError(null);
                    }}
                    rows={3}
                    placeholder="Please explain why you wish to return this product in detail..."
                    className={`w-full rounded-xl border p-3 text-xs text-paper placeholder-paper-muted/50 bg-ink-2 focus:outline-none transition-colors ${
                      returnLetterCount >= 10
                        ? "border-emerald-500/50 focus:border-emerald-500"
                        : returnOtherText.length > 0
                        ? "border-amber-500/50 focus:border-amber-500"
                        : "border-line focus:border-gold"
                    }`}
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={
                        returnLetterCount >= 10
                          ? "text-emerald-400 font-medium"
                          : returnOtherText.length > 0
                          ? "text-amber-400 font-medium"
                          : "text-paper-muted"
                      }
                    >
                      {returnLetterCount >= 10
                        ? `✓ Valid (${returnLetterCount} letters entered)`
                        : `${returnLetterCount}/10 letters entered (excluding numbers & symbols)`}
                    </span>
                    {returnLetterCount < 10 && (
                      <span className="text-[10.5px] text-paper-muted">
                        {10 - returnLetterCount} more letter{10 - returnLetterCount === 1 ? "" : "s"} needed
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-paper-muted mb-1.5">
                    Additional Details / Notes (Optional)
                  </label>
                  <textarea
                    value={returnComments}
                    onChange={(e) => setReturnComments(e.target.value)}
                    rows={3}
                    placeholder="Provide any helpful details for the returns team..."
                    className="w-full rounded-xl border border-line bg-ink-2 p-3 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnOpen(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-paper hover:bg-ink-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestReturnMutation.isPending || !isReturnValid}
                  className="rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-white hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {requestReturnMutation.isPending ? "Submitting..." : "Submit Return Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
