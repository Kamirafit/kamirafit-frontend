import Image from "next/image";
import { DEFAULT_PRODUCT_IMAGE, getValidImageSrc } from "@/lib/format";
import { Order, OrderStatus, OrderItem } from "../types";
import { formatPrice } from "@/lib/format";

type Props = {
  order: Order;
  onViewDetails: (order: Order) => void;
  onReviewProduct: (orderId: string, item: OrderItem) => void;
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

export default function OrderCard({ order, onViewDetails, onReviewProduct }: Props) {
  const dateStr = new Date(order.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

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
            <p className="mt-0.5 font-medium text-paper">{order.id}</p>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(order)}
          className="rounded-full border border-line px-4 py-2 text-[12px] font-semibold uppercase tracking-wider text-paper transition-colors hover:border-gold hover:text-gold"
        >
          View Details
        </button>
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-paper">
            Status
          </h3>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
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
                      onClick={() => onViewDetails(order)}
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
