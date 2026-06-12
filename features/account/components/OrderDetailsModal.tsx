"use client";

import Image from "next/image";
import { Order, OrderStatus } from "../types";
import { formatPrice } from "@/lib/format";

type Props = {
  order: Order;
  onClose: () => void;
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "Pending":
    case "Processing":
      return "bg-[#EAB308]/10 text-[#EAB308]";
    case "Confirmed":
    case "Shipped":
    case "In Transit":
      return "bg-blue-500/10 text-blue-500";
    case "Delivered":
      return "bg-[#22C55E]/10 text-[#22C55E]";
    case "Refund Initiated":
    case "Refund Completed":
      return "bg-orange-500/10 text-orange-500";
    case "Return Requested":
    case "Return Approved":
    case "Return In Progress":
    case "Return Completed":
      return "bg-purple-500/10 text-purple-500";
    case "Cancelled":
      return "bg-[#DC2626]/10 text-[#DC2626]";
    default:
      return "bg-paper-muted/10 text-paper-muted";
  }
};

export default function OrderDetailsModal({ order, onClose }: Props) {
  const dateStr = new Date(order.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-ink shadow-2xl backdrop-blur-xl">
        <div className="sticky top-0 z-10 border-b border-line bg-ink/95 px-6 py-4 backdrop-blur-md flex justify-between items-center">
          <div>
            <h2 className="font-display text-lg font-bold text-paper">
              Order Details
            </h2>
            <p className="text-sm text-paper-muted">{order.id} • {dateStr}</p>
          </div>
          <button onClick={onClose} className="text-paper-muted hover:text-paper">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted">
                Order Status
              </h3>
              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            {order.trackingNumber && (
              <p className="text-sm text-paper">
                <span className="text-paper-muted">Tracking ID: </span>
                <span className="font-medium text-gold">{order.trackingNumber}</span>
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted border-b border-line pb-2">
              Items Ordered
            </h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative h-20 w-16 overflow-hidden rounded-md border border-line bg-ink-2 shrink-0">
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
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
              ))}
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
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
