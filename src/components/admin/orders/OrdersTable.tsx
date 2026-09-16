"use client";

import type { AdminOrder as Order } from "@/types/entities";
import TableActions from "@/features/admin/components/TableActions";
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
      render: (o) => {
        const isCod = (o.paymentMethod || "").toUpperCase() === "COD";
        return (
          <div className="flex flex-col gap-1 items-start">
            <StatusBadge kind="payment" status={o.paymentStatus} />
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider uppercase border ${
                isCod
                  ? "border-amber-400 bg-amber-100 text-amber-950"
                  : "border-blue-400 bg-blue-100 text-blue-950"
              }`}
            >
              {isCod ? "COD" : "UPI"}
            </span>
          </div>
        );
      },
    },
    {
      key: "orderStatus",
      label: "Status",
      render: (o) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge kind="order" status={o.orderStatus} />
          {o.returnReason && (
            <span
              className="inline-flex items-center gap-1 text-[10px] text-orange-950 bg-orange-100 border border-orange-300 rounded px-1.5 py-0.5 max-w-[180px] truncate font-medium"
              title={o.returnReason}
            >
              <span className="shrink-0 font-bold">Return:</span>
              <span className="truncate">{o.returnReason.replace(/^Customer requested return:\s*/i, "")}</span>
            </span>
          )}
        </div>
      ),
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
        <TableActions
          actions={[
            {
              label: "View",
              onClick: () => onView(o),
            },
          ]}
        />
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
