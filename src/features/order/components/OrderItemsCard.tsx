"use client";

import type { OrderItem } from "@/types/entities";
import OrderItemRow from "./OrderItemRow";
import OrderFinancialSummary from "./OrderFinancialSummary";

type OrderItemsCardProps = {
  items: OrderItem[];
  itemsSubtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  shippingFee?: number;
  totalAmount: number;
};

export default function OrderItemsCard({
  items,
  itemsSubtotal,
  discountAmount = 0,
  couponCode,
  shippingFee = 0,
  totalAmount,
}: OrderItemsCardProps) {
  const totalItemCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  return (
    <section className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30">
      {/* Items Header */}
      <div className="p-6 sm:p-8 bg-surface-container-low border-b border-outline-variant/20">
        <h2 className="font-display text-xl sm:text-2xl text-primary font-medium">
          Items in This Order ({totalItemCount})
        </h2>
      </div>

      {/* Items List */}
      <div className="p-6 sm:p-8 flex flex-col gap-4 sm:gap-6">
        {items.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 italic text-center">
            No items recorded for this shipment.
          </p>
        ) : (
          items.map((item, idx) => (
            <OrderItemRow
              key={`${item.productId || idx}-${item.size || ""}-${item.color || ""}`}
              item={item}
            />
          ))
        )}

        {/* Financial Breakdown Ledger */}
        <OrderFinancialSummary
          itemsSubtotal={itemsSubtotal}
          discountAmount={discountAmount}
          couponCode={couponCode}
          shippingFee={shippingFee}
          totalAmount={totalAmount}
          itemCount={totalItemCount}
        />
      </div>
    </section>
  );
}
