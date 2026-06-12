"use client";

import { useState } from "react";
import OrderCard from "@/features/account/components/OrderCard";
import OrderDetailsModal from "@/features/account/components/OrderDetailsModal";
import ReviewFormModal from "@/features/account/components/ReviewFormModal";
import { MOCK_ORDERS } from "@/features/account/data/mockAccount";
import { Order } from "@/features/account/types";

export default function OrdersPage() {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewItem, setReviewItem] = useState<{orderId: string, productId: string, productName: string, productImage: string} | null>(null);

  const handleReviewSubmit = (review: { rating: number; comment: string }) => {
    console.log("Submitted Review:", review);
    // TODO: Send to API
    setReviewItem(null);
    alert("Thank you! Your review has been submitted.");
  };

  return (
    <div className="rounded-2xl border border-line bg-ink p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl font-bold text-paper">
        My Orders
      </h1>
      
      <div className="mt-8 flex flex-col gap-8">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onViewDetails={setSelectedOrder}
            onReviewProduct={(orderId, item) => setReviewItem({
              orderId,
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage
            })}
          />
        ))}
        {orders.length === 0 && (
          <div className="py-12 text-center text-paper-muted">
            <p>You haven&apos;t placed any orders yet.</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {reviewItem && (
        <ReviewFormModal
          orderId={reviewItem.orderId}
          productId={reviewItem.productId}
          productName={reviewItem.productName}
          productImage={reviewItem.productImage}
          onClose={() => setReviewItem(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
