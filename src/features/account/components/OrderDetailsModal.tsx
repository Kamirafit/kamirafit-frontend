"use client";

import { useState } from "react";
import Image from "next/image";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import { Order } from "../types";
import { formatPrice } from "@/lib/format";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTrackingModal from "./OrderTrackingModal";
import { useCancelOrder, useRequestReturn } from "@/services/order";

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
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("Wrong size / fit issue");
  const [returnComments, setReturnComments] = useState("");
  const [returnError, setReturnError] = useState<string | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const normStatus = (order.status || "").toUpperCase();
  const isCancellable =
    normStatus === "CONFIRMED" ||
    normStatus === "PROCESSING" ||
    normStatus === "PENDING_VERIFICATION" ||
    normStatus === "PENDING VERIFICATION";

  const isReturnable = normStatus === "DELIVERED";

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError(null);
    try {
      await cancelOrderMutation.mutateAsync({ id: order.id, reason: cancelReason });
      setActionSuccess("Order cancelled successfully. Stock has been restored to inventory.");
      setCancelOpen(false);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setCancelError(errorObj?.response?.data?.message || errorObj?.message || "Failed to cancel order.");
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnError(null);
    try {
      await requestReturnMutation.mutateAsync({
        id: order.id,
        reason: returnReason,
        comments: returnComments,
      });
      setActionSuccess("Return request submitted successfully. Our team will review it.");
      setReturnOpen(false);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setReturnError(errorObj?.response?.data?.message || errorObj?.message || "Failed to submit return request.");
    }
  };

  const customOrder = order as { createdAt?: string; orderNumber?: string; paymentStatus?: string } & Order;
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-scrollbar-hidden rounded-2xl border border-line bg-ink shadow-2xl backdrop-blur-xl">
        <div className="sticky top-0 z-10 border-b border-line bg-ink/95 px-6 py-4 backdrop-blur-md flex justify-between items-center">
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

            <div className="flex flex-wrap items-center gap-3">
              {order.trackingNumber && (
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
                  Request Return / Refund
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-paper-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-paper-muted">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 font-medium text-paper text-[15px]">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(order.totalAmount)}</span>
                </div>
                <p className="pt-2 text-paper-muted text-[12px]">
                  Paid via {order.paymentMethod}
                </p>
                <div className="pt-3">
                  <a
                    href={`/api/orders/${order.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-paper transition-colors hover:border-gold hover:text-gold"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Tax Invoice (PDF)
                  </a>
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
                : " All reserved items will be returned to inventory."}
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
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-line bg-ink-2 px-3 py-2 text-xs text-paper focus:border-gold focus:outline-none"
                >
                  <option value="Changed mind / Ordered by mistake">Changed mind / Ordered by mistake</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Estimated delivery time is too long">Estimated delivery time is too long</option>
                  <option value="Need to change shipping address or items">Need to change shipping address or items</option>
                  <option value="Other reasons">Other reasons</option>
                </select>
              </div>
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
                  disabled={cancelOrderMutation.isPending}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
              Items can be returned within 7 days of delivery. Once verified, returned items are re-added to inventory and your refund is processed.
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
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded-xl border border-line bg-ink-2 px-3 py-2 text-xs text-paper focus:border-gold focus:outline-none"
                >
                  <option value="Wrong size / fit issue">Wrong size / fit issue</option>
                  <option value="Defective or damaged piece">Defective or damaged piece</option>
                  <option value="Color or quality not as expected">Color or quality not as expected</option>
                  <option value="Received incorrect item">Received incorrect item</option>
                  <option value="Other">Other</option>
                </select>
              </div>
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
                  disabled={requestReturnMutation.isPending}
                  className="rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-white hover:bg-gold/90 disabled:opacity-50"
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
