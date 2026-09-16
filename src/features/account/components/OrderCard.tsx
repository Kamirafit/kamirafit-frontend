import Image from "next/image";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import { Order, OrderItem } from "../types";
import { formatPrice } from "@/lib/format";
import OrderStatusBadge from "./OrderStatusBadge";

type Props = {
  order: Order;
  onViewDetails: (order: Order) => void;
  onReviewProduct: (orderId: string, item: OrderItem) => void;
  onTrackPackage?: (order: Order) => void;
};

export default function OrderCard({ order, onViewDetails, onReviewProduct, onTrackPackage }: Props) {
  const customOrder = order as { createdAt?: string; orderNumber?: string } & Order;
  const dateValue = customOrder.createdAt || order.date;
  const dateStr = dateValue
    ? new Date(dateValue).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recent";

  const orderNum = customOrder.orderNumber || order.id;

  const normStatus = (order.status || "").toUpperCase();
  const isCancellable =
    normStatus === "CONFIRMED" ||
    normStatus === "PROCESSING" ||
    normStatus === "PENDING_VERIFICATION" ||
    normStatus === "PENDING VERIFICATION";

  const isReturnable = normStatus === "DELIVERED";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-ink shadow-sm transition-all duration-300 hover:border-gold/40 hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-ink-2 px-5 py-4 sm:flex-nowrap">
        <div className="flex flex-wrap gap-6 text-sm sm:flex-nowrap">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Order Placed</p>
            <p className="mt-0.5 font-medium text-paper">{dateStr}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Total</p>
            <p className="mt-0.5 font-medium text-paper">{formatPrice(order.totalAmount)}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Order ID</p>
            <p className="mt-0.5 font-medium text-paper">{orderNum}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCancellable && (
            <button
              onClick={() => onViewDetails(order)}
              className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-400 transition-colors hover:bg-red-500 hover:text-white"
            >
              Cancel
            </button>
          )}
          {isReturnable && (
            <button
              onClick={() => onViewDetails(order)}
              className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 transition-colors hover:bg-amber-500 hover:text-ink"
            >
              Return
            </button>
          )}
          <button
            onClick={() => onViewDetails(order)}
            className="rounded-full border border-line px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-paper transition-colors hover:border-gold hover:text-gold"
          >
            View Details
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-paper">
            Status
          </h3>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="flex flex-col gap-5">
          {order.items.map((item, index) => {
            const imageSrc = getValidImageSrc(item.productImage, DEFAULT_PRODUCT_IMAGE);
            return (
              <div key={index} className="flex flex-col sm:flex-row gap-4">
                <div className="relative h-24 w-20 overflow-hidden rounded-md border border-line bg-ink-2 shrink-0">
                  <Image src={imageSrc} alt={item.productName} fill className="object-cover" />
                </div>
              <div className="flex flex-1 flex-col justify-center sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-[15px] font-medium text-paper hover:text-gold cursor-pointer transition-colors">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-sm text-paper-muted">
                    Size: {item.size} • Color: {item.color}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => onTrackPackage ? onTrackPackage(order) : onViewDetails(order)}
                      className="text-[12px] font-semibold uppercase tracking-wider text-gold hover:text-gold-bright"
                    >
                      Track Package
                    </button>
                  </div>
                </div>
                {order.status === "Delivered" && (
                  <div className="mt-4 sm:mt-0">
                    <button
                      onClick={() => onReviewProduct(order.id, item)}
                      className="rounded-full bg-gold/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold hover:text-white"
                    >
                      Rate & Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
