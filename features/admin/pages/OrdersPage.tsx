"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "@/data/orders";
import SearchField from "../components/SearchField";
import { useAdminSelector } from "@/features/admin/hooks/redux";

type OrderFilter = "all" | OrderStatus;
type PaymentFilter = "all" | PaymentStatus;

const SELECT_CLASS =
  "rounded-full border border-line bg-ink-2 px-4 py-2.5 text-[13px] text-paper transition-colors duration-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

export default function OrdersPage() {
  const orders = useAdminSelector((s) => s.adminOrders.items);

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
              className={SELECT_CLASS}
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
              className={SELECT_CLASS}
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

      <OrdersTable
        rows={filtered}
        onView={(o) => setViewingId(o.id)}
        emptyLabel="No orders match your filters."
      />

      <OrderDetailsModal
        open={viewingId !== null}
        order={viewingOrder}
        onClose={() => setViewingId(null)}
      />
    </div>
  );
}
