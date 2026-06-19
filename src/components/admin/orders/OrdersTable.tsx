"use client";

import type { AdminOrder as Order } from "@/types/entities";
import ActionButton from "@/features/admin/components/ActionButton";
import DataTable, { type Column } from "@/features/admin/components/DataTable";
import StatusBadge from "./StatusBadge";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

type Props = {
  rows: Order[];
  onView: (order: Order) => void;
  emptyLabel?: string;
};

/**
 * Orders list. Reuses the shared admin DataTable so row hover, spacing, and
 * header typography match every other admin page (Products / Users /
 * Categories). Columns follow the brand spec order.
 */
export default function OrdersTable({ rows, onView, emptyLabel }: Props) {
  const columns: Column<Order>[] = [
    {
      key: "id",
      label: "Order ID",
      render: (o) => (
        <span className="font-semibold text-paper">{o.id}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (o) => (
        <div className="flex flex-col">
          <span className="font-medium text-paper">{o.customer.name}</span>
          <span className="text-[11.5px] text-paper-muted">
            {o.customer.phone}
          </span>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      align: "right",
      render: (o) => (
        <span className="text-paper">
          {o.items.reduce((s, it) => s + it.quantity, 0)}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (o) => (
        <span className="font-semibold text-gold">{formatPrice(o.total)}</span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (o) => <StatusBadge kind="payment" status={o.paymentStatus} />,
    },
    {
      key: "orderStatus",
      label: "Status",
      render: (o) => <StatusBadge kind="order" status={o.orderStatus} />,
    },
    {
      key: "createdAt",
      label: "Date",
      render: (o) => (
        <span className="text-paper-muted">{formatDate(o.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (o) => (
        <div className="flex items-center justify-end">
          <ActionButton onClick={() => onView(o)}>View</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(o) => o.id}
      emptyLabel={emptyLabel ?? "No orders match your filters."}
    />
  );
}
