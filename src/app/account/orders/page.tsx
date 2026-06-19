"use client";

import { useState } from "react";
import OrderCard from "@/features/account/components/OrderCard";
import OrderDetailsModal from "@/features/account/components/OrderDetailsModal";
import ReviewFormModal from "@/features/account/components/ReviewFormModal";
import { Order } from "@/features/account/types";
import { useOrders } from "@/services/order";
import OrderSkeleton from "@/components/skeleton/OrderSkeleton";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError, refetch } = useOrders();
  const isOnline = useOnlineStatus();
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
      
      {!isOnline && orders.length === 0 ? (
        <div className="mt-8"><OfflineState onRetry={() => void refetch()} /></div>
      ) : isLoading ? (
        <div className="mt-8">
          <OrderSkeleton />
        </div>
      ) : isError ? (
        <div className="mt-8"><ErrorState message="We couldn’t load your orders." onRetry={() => void refetch()} /></div>
      ) : orders.length === 0 ? (
        <div className="mt-8"><EmptyState title="No orders yet" description="When you place an order, you’ll be able to track it here." /></div>
      ) : (
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
        </div>
      )}

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
