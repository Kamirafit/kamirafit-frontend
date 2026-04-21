"use client";

import Image from "next/image";
import { useMemo } from "react";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/data/orders";
import Modal from "@/features/admin/components/Modal";
import { updateOrderStatus } from "@/features/admin/store/ordersSlice";
import { useAppDispatch } from "@/features/product/hooks/redux";
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

function FieldGrid({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-1">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper-muted">
            {r.label}
          </dt>
          <dd className="text-[13px] text-paper">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-[15px] font-semibold text-paper">
      {children}
    </h3>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
};

/**
 * Shows the full order record + inline status update. Status changes are
 * dispatched to Redux so the parent table reflects them instantly.
 */
export default function OrderDetailsModal({ open, onClose, order }: Props) {
  const dispatch = useAppDispatch();
  const title = useMemo(() => (order ? `Order ${order.id}` : "Order"), [order]);

  if (!order) {
    return (
      <Modal open={open} onClose={onClose} title={title} maxWidth="lg">
        <p className="text-[13px] text-paper-muted">Order not found.</p>
      </Modal>
    );
  }

  const handleStatusChange = (next: OrderStatus) => {
    dispatch(updateOrderStatus({ id: order.id, status: next }));
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="lg">
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle>Order info</SectionTitle>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge kind="payment" status={order.paymentStatus} />
              <StatusBadge kind="order" status={order.orderStatus} />
            </div>
          </div>
          <FieldGrid
            rows={[
              { label: "Order ID", value: order.id },
              { label: "Placed on", value: formatDate(order.createdAt) },
              {
                label: "Payment status",
                value: (
                  <StatusBadge kind="payment" status={order.paymentStatus} />
                ),
              },
              {
                label: "Items",
                value: `${order.items.reduce((s, it) => s + it.quantity, 0)} piece(s)`,
              },
            ]}
          />
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle>Customer</SectionTitle>
          <FieldGrid
            rows={[
              { label: "Name", value: order.customer.name },
              { label: "Phone", value: order.customer.phone },
              {
                label: "Shipping address",
                value: (
                  <span className="block leading-relaxed text-paper">
                    {order.customer.address}
                  </span>
                ),
              },
            ]}
          />
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle>Products</SectionTitle>
          <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-ink-2/40">
            {order.items.map((it) => (
              <li
                key={`${it.productId}-${it.size}-${it.color}`}
                className="flex items-center gap-4 p-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-ink-2">
                  <Image
                    src={it.image}
                    alt={it.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-[13px] font-medium text-paper">
                    {it.name}
                  </p>
                  <p className="text-[11.5px] uppercase tracking-[0.12em] text-paper-muted">
                    Size {it.size} · {it.color} · Qty {it.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-gold">
                    {formatPrice(it.price * it.quantity)}
                  </p>
                  <p className="text-[11px] text-paper-muted">
                    {formatPrice(it.price)} each
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <SectionTitle>Summary</SectionTitle>
          <dl className="flex flex-col gap-2 rounded-2xl border border-line bg-ink-2/40 p-4 text-[13px]">
            <div className="flex items-center justify-between">
              <dt className="text-paper-muted">Subtotal</dt>
              <dd className="text-paper">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-paper-muted">Delivery fee</dt>
              <dd className="text-paper">{formatPrice(order.deliveryFee)}</dd>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-line pt-3">
              <dt className="font-display text-[14px] font-semibold text-paper">
                Total
              </dt>
              <dd className="font-display text-[16px] font-semibold text-gold">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-2/40 p-4">
          <div className="flex flex-col gap-1">
            <SectionTitle>Update order status</SectionTitle>
            <p className="text-[11.5px] text-paper-muted">
              Changes apply instantly and reflect in the orders table.
            </p>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="sr-only">Order status</span>
            <select
              value={order.orderStatus}
              onChange={(e) =>
                handleStatusChange(e.target.value as OrderStatus)
              }
              className="w-full rounded-full border border-line bg-ink-2 px-4 py-2.5 text-[13px] text-paper transition-colors duration-300 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-ink">
                  {s}
                </option>
              ))}
            </select>
          </label>
        </section>
      </div>
    </Modal>
  );
}
