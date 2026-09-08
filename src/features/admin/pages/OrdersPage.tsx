"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import {
  ADMIN_ORDER_STATUSES as ORDER_STATUSES,
  PAYMENT_STATUSES,
  type AdminOrder as Order,
  type AdminOrderStatus as OrderStatus,
  type PaymentStatus,
} from "@/types/entities";
import { selectClass } from "../components/FormField";
import SearchField from "../components/SearchField";
import { useAdminOrders } from "@/services/admin";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

type OrderFilter = "all" | OrderStatus;
type PaymentFilter = "all" | PaymentStatus;

export default function OrdersPage() {
  const ordersQuery = useAdminOrders();
  const { data: orders = [] } = ordersQuery;
  const isLoading = ordersQuery.isLoading || (ordersQuery.isFetching && orders.length === 0);
  const isOnline = useOnlineStatus();

  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [viewingId, setViewingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q);
      const matchesOrder =
        orderFilter === "all" || o.orderStatus === orderFilter;
      const matchesPayment =
        paymentFilter === "all" || o.paymentStatus === paymentFilter;
      return matchesQuery && matchesOrder && matchesPayment;
    });
  }, [orders, query, orderFilter, paymentFilter]);

  // Always source the viewed order from Redux so status edits inside the
  // modal update the visible record immediately.
  const viewingOrder: Order | null = viewingId
    ? orders.find((o) => o.id === viewingId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Operations"
        title="Orders"
        description="Track, filter, and update the status of every customer order. Changes propagate instantly across the admin."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-xs">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search by order ID or customer…"
            label="Search orders"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
              Status
            </span>
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value as OrderFilter)}
              className={selectClass}
            >
              <option value="all" className="bg-ink">
                All statuses
              </option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-ink">
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
              Payment
            </span>
            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as PaymentFilter)
              }
              className={selectClass}
            >
              <option value="all" className="bg-ink">
                All payments
              </option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-ink">
                  {s}
                </option>
              ))}
            </select>
          </label>
          <span className="text-[12px] text-paper-muted">
            {filtered.length} of {orders.length}
          </span>
        </div>
      </div>

      {!isOnline && orders.length === 0 ? (
        <OfflineState onRetry={() => void ordersQuery.refetch()} />
      ) : isLoading ? (
        <AdminTableSkeleton />
      ) : ordersQuery.isError ? (
        <ErrorState message="We couldn’t load orders." onRetry={() => void ordersQuery.refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="New customer orders will appear here." />
      ) : (
        <OrdersTable
          rows={filtered}
          onView={(o) => setViewingId(o.id)}
          emptyLabel="No orders match your filters."
        />
      )}

      <OrderDetailsModal
        open={viewingId !== null}
        order={viewingOrder}
        onClose={() => setViewingId(null)}
      />
    </div>
  );
}
