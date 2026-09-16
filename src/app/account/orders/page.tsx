"use client";

import { useState, useMemo, useRef } from "react";
import OrderCard from "@/features/account/components/OrderCard";
import OrderDetailsModal from "@/features/account/components/OrderDetailsModal";
import OrderTrackingModal from "@/features/account/components/OrderTrackingModal";
import ReviewFormModal from "@/features/account/components/ReviewFormModal";
import { Order } from "@/features/account/types";
import { useOrders } from "@/services/order";
import { useCreateReview } from "@/services/review";
import { useProfile } from "@/features/auth/hooks";
import OrderSkeleton from "@/components/skeleton/OrderSkeleton";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const ordersQuery = useOrders();
  const { data: orders = [], isError, refetch } = ordersQuery;
  const isLoading = ordersQuery.isLoading || ordersQuery.isFetching;
  const isOnline = useOnlineStatus();
  const { data: profile } = useProfile();
  const createReviewMutation = useCreateReview();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [reviewItem, setReviewItem] = useState<{
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
  } | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersContainerRef = useRef<HTMLDivElement>(null);

  // Determine dynamic list of years based on account creation / order history
  const currentYear = new Date().getFullYear();
  const accountCreatedYear = useMemo(() => {
    let earliest = currentYear;
    const profileCreatedAt = (profile as { createdAt?: string } | undefined)?.createdAt;
    if (profileCreatedAt) {
      const pYear = new Date(profileCreatedAt).getFullYear();
      if (!isNaN(pYear) && pYear < earliest) earliest = pYear;
    }
    for (const ord of orders) {
      const oDate = (ord as { createdAt?: string }).createdAt || ord.date;
      if (oDate) {
        const oYear = new Date(oDate).getFullYear();
        if (!isNaN(oYear) && oYear < earliest) earliest = oYear;
      }
    }
    return earliest;
  }, [profile, orders, currentYear]);

  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= accountCreatedYear; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear, accountCreatedYear]);

  // Filter orders by search query and time range
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    const query = searchQuery.trim().toLowerCase().replace(/[₹,]/g, "");

    return orders.filter((order) => {
      // 1. Time range filter
      if (timeFilter !== "all") {
        const orderDateVal = (order as { createdAt?: string }).createdAt || order.date;
        if (orderDateVal) {
          const orderTime = new Date(orderDateVal).getTime();
          if (!isNaN(orderTime)) {
            if (timeFilter === "30_days") {
              const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
              if (orderTime < thirtyDaysAgo) return false;
            } else if (timeFilter === "6_months") {
              const sixMonthsAgo = now - 182.5 * 24 * 60 * 60 * 1000;
              if (orderTime < sixMonthsAgo) return false;
            } else if (timeFilter.startsWith("year_")) {
              const targetYear = parseInt(timeFilter.replace("year_", ""), 10);
              const orderYear = new Date(orderDateVal).getFullYear();
              if (orderYear !== targetYear) return false;
            }
          }
        }
      }

      // 2. Search query across product name, order ID, and price
      if (query) {
        const orderNum = ((order as { orderNumber?: string }).orderNumber || order.id || "").toLowerCase();
        if (orderNum.includes(query)) return true;

        const totalStr = String(order.totalAmount || "");
        if (totalStr.includes(query)) return true;

        const hasProductMatch = (order.items || []).some((item) => {
          const pName = (item.productName || "").toLowerCase();
          const pPrice = String(item.price || "");
          const pColor = (item.color || "").toLowerCase();
          const pSize = (item.size || "").toLowerCase();
          return (
            pName.includes(query) ||
            pPrice.includes(query) ||
            pColor.includes(query) ||
            pSize.includes(query)
          );
        });

        if (hasProductMatch) return true;

        return false;
      }

      return true;
    });
  }, [orders, searchQuery, timeFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, effectiveCurrentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (ordersContainerRef.current) {
      ordersContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReviewSubmit = async (review: {
    orderId: string;
    productId: string;
    rating: number;
    title: string;
    comment: string;
    images: string[];
  }) => {
    try {
      await createReviewMutation.mutateAsync({
        productId: review.productId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
      });
      setReviewItem(null);
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div ref={ordersContainerRef} className="rounded-2xl border border-line bg-ink p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-paper">
            My Orders
          </h1>
          <p className="mt-1 text-xs text-paper-muted">
            Track deliveries, manage cancellations, and request returns within 7 days.
          </p>
        </div>
        {orders.length > 0 && (
          <span className="self-start sm:self-auto rounded-full border border-line bg-ink-2 px-3 py-1 text-xs font-semibold text-paper-muted">
            Total Orders: <span className="text-paper">{orders.length}</span>
          </span>
        )}
      </div>

      {/* Search & Filter Controls (only shown when user has orders or is searching) */}
      {!isLoading && orders.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-line/60 bg-ink-2/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-paper-muted">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by product name, order ID, or price..."
              className="w-full rounded-xl border border-line bg-ink py-2.5 pl-10 pr-9 text-xs text-paper placeholder-paper-muted/60 transition-colors focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-paper-muted hover:text-paper"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Time Filter Select */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="order-time-filter" className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted shrink-0">
              Filter:
            </label>
            <div className="relative">
              <select
                id="order-time-filter"
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-line bg-ink pl-3.5 pr-8 py-2.5 text-xs font-medium text-paper transition-colors focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
              >
                <option value="all">All Orders</option>
                <option value="30_days">Last 30 Days</option>
                <option value="6_months">Last 6 Months</option>
                {availableYears.map((year) => (
                  <option key={year} value={`year_${year}`}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-paper-muted">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!isOnline && orders.length === 0 ? (
        <div className="mt-8">
          <OfflineState onRetry={() => void refetch()} />
        </div>
      ) : isLoading ? (
        <div className="mt-8">
          <OrderSkeleton />
        </div>
      ) : isError ? (
        <div className="mt-8">
          <ErrorState message="We couldn’t load your orders." onRetry={() => void refetch()} />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No orders yet"
            description="When you place an order, you’ll be able to track it here."
          />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line p-10 text-center">
          <div className="rounded-full bg-ink-2 p-3.5 text-paper-muted">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="mt-3 font-display text-base font-semibold text-paper">
            No matching orders found
          </h3>
          <p className="mt-1 text-xs text-paper-muted max-w-sm">
            We couldn&apos;t find any orders matching {searchQuery ? `"${searchQuery}"` : "your criteria"}. Try checking for typos or choosing a different period.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setTimeFilter("all");
              setCurrentPage(1);
            }}
            className="mt-5 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-ink transition-colors"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {/* Active Filter Summary when filtering */}
          {(searchQuery || timeFilter !== "all") && (
            <div className="flex items-center justify-between text-xs text-paper-muted">
              <p>
                Found <span className="font-semibold text-paper">{filteredOrders.length}</span>{" "}
                {filteredOrders.length === 1 ? "order" : "orders"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTimeFilter("all");
                  setCurrentPage(1);
                }}
                className="text-xs text-gold hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Orders List (10 per page) */}
          <div className="flex flex-col gap-6">
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={setSelectedOrder}
                onTrackPackage={setTrackingOrder}
                onReviewProduct={(orderId, item) =>
                  setReviewItem({
                    orderId,
                    productId: item.productId,
                    productName: item.productName,
                    productImage: item.productImage,
                  })
                }
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-6 sm:flex-row">
              <p className="text-xs text-paper-muted">
                Showing <span className="font-medium text-paper">{(effectiveCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                <span className="font-medium text-paper">
                  {Math.min(effectiveCurrentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                </span>{" "}
                of <span className="font-medium text-paper">{filteredOrders.length}</span> orders
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={effectiveCurrentPage === 1}
                  onClick={() => handlePageChange(Math.max(1, effectiveCurrentPage - 1))}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-paper transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-paper"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                        pageNum === effectiveCurrentPage
                          ? "bg-gold text-ink font-bold"
                          : "border border-line text-paper hover:border-gold hover:text-gold"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={effectiveCurrentPage === totalPages}
                  onClick={() => handlePageChange(Math.min(totalPages, effectiveCurrentPage + 1))}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-paper transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-paper"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {trackingOrder && (
        <OrderTrackingModal
          orderId={trackingOrder.id}
          orderNumber={(trackingOrder as { orderNumber?: string }).orderNumber}
          onClose={() => setTrackingOrder(null)}
        />
      )}

      {reviewItem && (
        <ReviewFormModal
          orderId={reviewItem.orderId}
          productId={reviewItem.productId}
          productName={reviewItem.productName}
          productImage={reviewItem.productImage}
          isSubmitting={createReviewMutation.isPending}
          onClose={() => setReviewItem(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
