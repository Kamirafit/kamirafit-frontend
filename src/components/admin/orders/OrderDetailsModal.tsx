"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import {
  ADMIN_ORDER_STATUSES as ORDER_STATUSES,
  PAYMENT_STATUSES,
  type AdminOrder as Order,
  type AdminOrderItem as OrderItem,
  type AdminOrderStatus as OrderStatus,
  type PaymentStatus,
} from "@/types/entities";
import ConfirmDialog from "@/features/admin/components/ConfirmDialog";
import FormField, {
  inputClass,
  selectClass,
  textareaClass,
} from "@/features/admin/components/FormField";
import Modal from "@/features/admin/components/Modal";
import {
  useUpdateAdminOrder,
  useDeleteAdminOrder,
  useFulfillAdminOrder,
  useSyncAdminOrderWithShiprocket,
} from "@/services/admin";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/features/product/types";
import StatusBadge from "./StatusBadge";
import ErrorState from "@/components/states/ErrorState";

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

type DraftCustomer = { name: string; phone: string; address: string };
type DraftItem = OrderItem;

type Draft = {
  customer: DraftCustomer;
  items: DraftItem[];
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  courierName?: string;
  trackingCode?: string;
  trackingUrl?: string;
  notes?: string;
};

function buildDraft(order: Order): Draft {
  return {
    customer: { ...order.customer },
    items: order.items.map((it) => ({ ...it })),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    courierName: order.courierName || "",
    trackingCode: order.trackingCode || "",
    trackingUrl: order.trackingUrl || "",
    notes: order.notes || "",
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-[15px] font-semibold text-paper">
      {children}
    </h3>
  );
}

function SummaryRow({
  label,
  value,
  emphasise = false,
}: {
  label: string;
  value: string;
  emphasise?: boolean;
}) {
  return (
    <div
      className={
        emphasise
          ? "mt-1 flex items-center justify-between border-t border-line pt-3"
          : "flex items-center justify-between"
      }
    >
      <dt
        className={
          emphasise
            ? "font-display text-[14px] font-semibold text-paper"
            : "text-paper-muted"
        }
      >
        {label}
      </dt>
      <dd
        className={
          emphasise
            ? "font-display text-[16px] font-semibold text-gold"
            : "text-paper"
        }
      >
        {value}
      </dd>
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
};

export default function OrderDetailsModal({ open, onClose, order }: Props) {
  const updateMutation = useUpdateAdminOrder();
  const fulfillMutation = useFulfillAdminOrder();
  const deleteMutation = useDeleteAdminOrder();
  const syncMutation = useSyncAdminOrderWithShiprocket();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showFulfillSection, setShowFulfillSection] = useState(false);

  useEffect(() => {
    if (open && order) {
      setDraft(buildDraft(order));
      setShowFulfillSection(Boolean(order.trackingCode || order.courierName));
    } else if (!open) {
      setDraft(null);
      setConfirmDelete(false);
      setShowFulfillSection(false);
    }
  }, [open, order]);

  const totals = useMemo(() => {
    if (!order || !draft) return { subtotal: 0, delivery: 0, total: 0 };
    const subtotal = draft.items.reduce(
      (s, it) => s + it.price * it.quantity,
      0,
    );
    return {
      subtotal,
      delivery: order.deliveryFee,
      total: subtotal + order.deliveryFee,
    };
  }, [draft, order]);

  if (!order) {
    return (
      <Modal open={open} onClose={onClose} title="Order" maxWidth="lg">
        <p className="text-[13px] text-paper-muted">Order not found.</p>
      </Modal>
    );
  }

  if (!draft) {
    return (
      <Modal open={open} onClose={onClose} title={`Order ${order.id}`} maxWidth="lg">
        <p className="text-[13px] text-paper-muted">Loading…</p>
      </Modal>
    );
  }

  const setCustomer = <K extends keyof DraftCustomer>(
    key: K,
    value: DraftCustomer[K],
  ) =>
    setDraft((d) =>
      d ? { ...d, customer: { ...d.customer, [key]: value } } : d,
    );

  const setItem = <K extends keyof DraftItem>(
    idx: number,
    key: K,
    value: DraftItem[K],
  ) =>
    setDraft((d) => {
      if (!d) return d;
      const items = d.items.map((it, i) =>
        i === idx ? { ...it, [key]: value } : it,
      );
      return { ...d, items };
    });

  const removeItem = (idx: number) =>
    setDraft((d) =>
      d ? { ...d, items: d.items.filter((_, i) => i !== idx) } : d,
    );

  const handleSave = () => {
    if (!draft) return;
    updateMutation.mutate(
      {
        id: order.id,
        patch: {
          customer: draft.customer,
          items: draft.items,
          paymentStatus: draft.paymentStatus,
          orderStatus: draft.orderStatus,
        },
      },
      { onSuccess: onClose },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(order.id, { onSuccess: onClose });
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Order ${order.id}`}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-8">
          {updateMutation.isError || deleteMutation.isError ? <ErrorState className="min-h-0 py-6" title="Order change not saved" message="Please try that action again." /> : null}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle>Order info</SectionTitle>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={syncMutation.isPending}
                  onClick={() => {
                    syncMutation.mutate(order.id, {
                      onSuccess: (updated) => {
                        if (updated) {
                          setDraft(buildDraft(updated));
                        }
                      },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold hover:bg-gold hover:text-white transition-all disabled:opacity-50"
                  title="Fetch real-time tracking status from Shiprocket"
                >
                  <svg
                    className={`h-3 w-3 ${syncMutation.isPending ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {syncMutation.isPending ? "Syncing..." : "Sync Shiprocket"}
                </button>
                <StatusBadge kind="payment" status={draft.paymentStatus} />
                <StatusBadge kind="order" status={draft.orderStatus} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper-muted">
                  Order ID
                </span>
                <span className="text-[13px] text-paper">{order.id}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper-muted">
                  Placed on
                </span>
                <span className="text-[13px] text-paper">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <FormField label="Payment status">
                <select
                  value={draft.paymentStatus}
                  onChange={(e) =>
                    setDraft((d) =>
                      d
                        ? { ...d, paymentStatus: e.target.value as PaymentStatus }
                        : d,
                    )
                  }
                  className={selectClass}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-ink">
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Order status">
                <select
                  value={draft.orderStatus}
                  onChange={(e) =>
                    setDraft((d) =>
                      d
                        ? { ...d, orderStatus: e.target.value as OrderStatus }
                        : d,
                    )
                  }
                  className={selectClass}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-ink">
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <SectionTitle>Customer</SectionTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Name">
                <input
                  type="text"
                  value={draft.customer.name}
                  onChange={(e) => setCustomer("name", e.target.value)}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Phone">
                <input
                  type="tel"
                  value={draft.customer.phone}
                  onChange={(e) => setCustomer("phone", e.target.value)}
                  className={inputClass}
                />
              </FormField>
            </div>
            <FormField label="Shipping address">
              <textarea
                value={draft.customer.address}
                onChange={(e) => setCustomer("address", e.target.value)}
                className={textareaClass}
              />
            </FormField>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SectionTitle>Fulfillment & Tracking</SectionTitle>
              {!showFulfillSection && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFulfillSection(true)}
                >
                  Attach Tracking
                </Button>
              )}
            </div>

            {showFulfillSection && (
              <div className="rounded-2xl border border-line bg-ink-2/40 p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Courier / Logistics Partner">
                    <input
                      type="text"
                      placeholder="e.g. BlueDart Express, Delhivery"
                      value={draft.courierName || ""}
                      onChange={(e) =>
                        setDraft((d) => (d ? { ...d, courierName: e.target.value } : d))
                      }
                      className={inputClass}
                    />
                  </FormField>
                  <FormField label="Tracking Code / AWB">
                    <input
                      type="text"
                      placeholder="e.g. BD849204910IN"
                      value={draft.trackingCode || ""}
                      onChange={(e) =>
                        setDraft((d) => (d ? { ...d, trackingCode: e.target.value } : d))
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>
                <FormField label="Tracking URL (Optional)">
                  <input
                    type="url"
                    placeholder="https://track.courier.com/..."
                    value={draft.trackingUrl || ""}
                    onChange={(e) =>
                      setDraft((d) => (d ? { ...d, trackingUrl: e.target.value } : d))
                    }
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Fulfillment Notes (Optional)">
                  <input
                    type="text"
                    placeholder="Handed over to logistics partner"
                    value={draft.notes || ""}
                    onChange={(e) =>
                      setDraft((d) => (d ? { ...d, notes: e.target.value } : d))
                    }
                    className={inputClass}
                  />
                </FormField>
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!draft.courierName || !draft.trackingCode || fulfillMutation.isPending}
                    onClick={() => {
                      if (!draft || !draft.courierName || !draft.trackingCode) return;
                      fulfillMutation.mutate({
                        id: order.id,
                        data: {
                          courierName: draft.courierName,
                          trackingCode: draft.trackingCode,
                          trackingUrl: draft.trackingUrl,
                          notes: draft.notes,
                        },
                      });
                    }}
                  >
                    {fulfillMutation.isPending ? "Updating..." : "Dispatch / Fulfill Order"}
                  </Button>
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle>Products</SectionTitle>
              <span className="text-[11.5px] text-paper-muted">
                {draft.items.reduce((s, it) => s + it.quantity, 0)} piece(s)
              </span>
            </div>
            {draft.items.length === 0 ? (
              <p className="rounded-2xl border border-line bg-ink-2/40 p-4 text-[13px] text-paper-muted">
                All items removed — save to record an empty order or cancel.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {draft.items.map((it, idx) => (
                  <li
                    key={`${it.productId}-${idx}`}
                    className="flex flex-col gap-3 rounded-2xl border border-line bg-ink-2/40 p-4 sm:flex-row sm:items-start"
                  >
                    <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-ink-2">
                        <Image
                          src={it.image}
                          alt={it.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col sm:hidden">
                        <p className="text-[13px] font-medium text-paper">
                          {it.name}
                        </p>
                        <p className="text-[11.5px] text-paper-muted">
                          {formatPrice(it.price)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3">
                      <div className="hidden flex-col sm:flex">
                        <p className="text-[13px] font-medium text-paper">
                          {it.name}
                        </p>
                        <p className="text-[11.5px] text-paper-muted">
                          {formatPrice(it.price)} each ·{" "}
                          {formatPrice(it.price * it.quantity)} line total
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <FormField label="Size">
                          <select
                            value={it.size}
                            onChange={(e) =>
                              setItem(idx, "size", e.target.value)
                            }
                            className={selectClass}
                          >
                            {SIZE_OPTIONS.map((s) => (
                              <option key={s} value={s} className="bg-ink">
                                {s}
                              </option>
                            ))}
                          </select>
                        </FormField>
                        <FormField label="Color">
                          <select
                            value={it.color}
                            onChange={(e) =>
                              setItem(idx, "color", e.target.value)
                            }
                            className={selectClass}
                          >
                            {COLOR_OPTIONS.map((c) => (
                              <option key={c} value={c} className="bg-ink">
                                {c}
                              </option>
                            ))}
                          </select>
                        </FormField>
                        <FormField label="Qty">
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) =>
                              setItem(
                                idx,
                                "quantity",
                                Math.max(1, Number(e.target.value) || 1),
                              )
                            }
                            className={inputClass}
                          />
                        </FormField>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="self-start rounded-full border border-line px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-paper-muted transition-colors hover:border-[#B3261E] hover:text-[#B3261E]"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>Summary</SectionTitle>
            <dl className="flex flex-col gap-2 rounded-2xl border border-line bg-ink-2/40 p-4 text-[13px]">
              <SummaryRow
                label="Subtotal"
                value={formatPrice(totals.subtotal)}
              />
              <SummaryRow
                label="Delivery fee"
                value={formatPrice(totals.delivery)}
              />
              <SummaryRow
                label="Total"
                value={formatPrice(totals.total)}
                emphasise
              />
            </dl>
            <p className="text-[11.5px] text-paper-muted">
              Totals recalculate live as you change items or quantities.
            </p>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5">
            <Button
              variant="dark"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="!bg-[#B3261E] !text-paper hover:!bg-[#92201A]"
            >
              Delete order
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="dark" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this order?"
        description={`Order ${order.id} will be removed from the admin. This cannot be undone.`}
        confirmLabel="Delete order"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
        danger
      />
    </>
  );
}
