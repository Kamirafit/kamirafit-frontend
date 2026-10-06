"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import {
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
  useSyncAdminOrderWithShiprocket,
  useGetAdminOrderShippingLabel,
  useGetAdminOrderManifest,
  useAdminProducts,
} from "@/services/admin";
import { orderService } from "@/services/order";
import StatusBadge from "./StatusBadge";
import { adminToast } from "@/features/admin/context/AdminToastContext";

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
};

function buildDraft(order: Order): Draft {
  return {
    customer: { ...order.customer },
    items: order.items.map((it) => ({ ...it })),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-[14.5px] font-semibold text-paper">
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

function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred.";
  const err = error as {
    response?: {
      data?: {
        message?: string;
        details?: Array<{ field?: string; message?: string }>;
      };
    };
    message?: string;
  };
  const data = err?.response?.data;
  if (data?.details && Array.isArray(data.details) && data.details.length > 0) {
    return data.details
      .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
      .join(", ");
  }
  return data?.message || err?.message || "Failed to update order.";
}

// Strict valid next transitions matching backend lifecycle validation
const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  New: ["Confirmed", "Processing", "Ready to Ship", "Cancelled"],
  Confirmed: ["Processing", "Ready to Ship", "Shipped", "Cancelled"],
  CONFIRMED: ["Processing", "Ready to Ship", "Shipped", "Cancelled"],
  Pending: ["Confirmed", "Processing", "Cancelled"],
  PENDING_VERIFICATION: ["Confirmed", "Processing", "Cancelled"],
  Processing: ["Ready to Ship", "Shipped", "Cancelled"],
  PROCESSING: ["Ready to Ship", "Shipped", "Cancelled"],
  "Ready to Ship": ["Shipped", "Out For Delivery", "Delivered", "Cancelled"],
  Packed: ["Shipped", "Out For Delivery", "Delivered", "Cancelled"],
  PACKED: ["Shipped", "Out For Delivery", "Delivered", "Cancelled"],
  "Pickup Scheduled": ["Ready to Ship", "Shipped", "Cancelled"],
  "Picked Up": ["Out For Delivery", "Delivered", "Returned"],
  "In Transit": ["Delivered", "Returned"],
  Shipped: ["Out For Delivery", "Delivered", "Returned"],
  SHIPPED: ["Out For Delivery", "Delivered", "Returned"],
  "Out For Delivery": ["Delivered", "Returned"],
  OUT_FOR_DELIVERY: ["Delivered", "Returned"],
  Delivered: ["Return Requested", "Return Approved", "Returned"],
  DELIVERED: ["Return Requested", "Return Approved", "Returned"],
  "Return Requested": ["Return Approved", "Returned", "Refunded", "Cancelled"],
  RETURN_REQUESTED: ["Return Approved", "Returned", "Refunded", "Cancelled"],
  "Return Approved": ["Returned", "Refunded"],
  RETURN_APPROVED: ["Returned", "Refunded"],
  "Return In Progress": ["Returned", "Refunded"],
  RETURN_IN_PROGRESS: ["Returned", "Refunded"],
  "Return Rejected": ["Return Approved", "Returned"],
  RETURN_REJECTED: ["Return Approved", "Returned"],
  "RTO Initiated": ["Returned", "Refunded"],
  "RTO Delivered": ["Refunded"],
  Returned: ["Refunded"],
  RETURNED: ["Refunded"],
  "Return Completed": ["Refunded"],
  RETURN_COMPLETED: ["Refunded"],
  "Refund Initiated": ["Refunded"],
  REFUND_INITIATED: ["Refunded"],
  Refunded: [],
  REFUNDED: [],
  Cancelled: [],
  CANCELLED: [],
};

function getAllowedTransitions(status: string): string[] {
  const trimmed = String(status || "").trim();
  if (ALLOWED_STATUS_TRANSITIONS[trimmed]) {
    return ALLOWED_STATUS_TRANSITIONS[trimmed];
  }
  const match = Object.keys(ALLOWED_STATUS_TRANSITIONS).find(
    (k) => k.toLowerCase() === trimmed.toLowerCase(),
  );
  if (match) return ALLOWED_STATUS_TRANSITIONS[match];

  const lower = trimmed.toLowerCase();
  if (lower.includes("refund")) return [];
  if (lower.includes("cancel")) return [];
  if (lower.includes("return") || lower.includes("rto")) {
    return ["Refunded"];
  }
  return [];
}

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
};

export default function OrderDetailsModal({ open, onClose, order }: Props) {
  const updateMutation = useUpdateAdminOrder();
  const deleteMutation = useDeleteAdminOrder();
  const syncMutation = useSyncAdminOrderWithShiprocket();
  const getShippingLabelMutation = useGetAdminOrderShippingLabel();
  const getManifestMutation = useGetAdminOrderManifest();
  const productsQuery = useAdminProducts();
  const catalogProducts = productsQuery.data || [];

  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (open && order) {
      setDraft(buildDraft(order));
    } else if (!open) {
      setDraft(null);
      setConfirmDelete(false);
      setCopiedId(false);
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

  const allowedNextStatuses = useMemo(() => {
    return order ? getAllowedTransitions(order.orderStatus) : [];
  }, [order]);

  // Customer can cancel up until the order is packed / handed over to courier for shipping.
  // After dispatch (Shipped, Picked Up, In Transit, Out For Delivery, Delivered, Returns, Terminal states),
  // item specifications (size, color, quantity) are locked and cannot be changed.
  const isItemEditable = useMemo(() => {
    if (!order) return false;
    const normalized = (order.orderStatus || "")
      .toLowerCase()
      .replace(/[\s_-]+/g, " ")
      .trim();
    const cancellableStatuses = new Set([
      "new",
      "confirmed",
      "pending",
      "pending verification",
      "processing",
      "ready to ship",
      "packed",
    ]);
    return cancellableStatuses.has(normalized);
  }, [order]);

  if (!order) {
    return (
      <Modal open={open} onClose={onClose} title="Order Details" maxWidth="xl">
        <p className="text-[13px] text-paper-muted">Order not found.</p>
      </Modal>
    );
  }

  if (!draft) {
    return (
      <Modal open={open} onClose={onClose} title={`Order ${order.id}`} maxWidth="xl">
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

  const removeItem = (idx: number) =>
    setDraft((d) =>
      d ? { ...d, items: d.items.filter((_, i) => i !== idx) } : d,
    );

  const handleCopyOrderId = () => {
    if (!order?.id) return;
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

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
      {
        onSuccess: () => {
          adminToast.success(
            `Order ${order.id} updated successfully.`,
            "Order Saved",
          );
          onClose();
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(order.id, {
      onSuccess: () => {
        adminToast.success(
          `Order ${order.id} deleted successfully.`,
          "Order Deleted",
        );
        setConfirmDelete(false);
        onClose();
      },
    });
  };

  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      setInvoiceError(null);
      const res = await orderService.downloadInvoice(order.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setInvoiceError(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Failed to download tax invoice.",
      );
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const isBusy = updateMutation.isPending || deleteMutation.isPending;
  const isCod = (order.paymentMethod || "").toUpperCase() === "COD";

  return (
    <>
      <Modal
        open={open}
        onClose={isBusy ? () => {} : onClose}
        title={`Order ${order.id}`}
        maxWidth="xl"
      >
        <div className="flex flex-col gap-6">
          {/* Error Message Banner */}
          {updateMutation.isError || deleteMutation.isError ? (
            <div className="rounded-2xl border border-red-400/80 bg-red-50 p-4 text-red-950 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-200 text-red-900 text-sm font-bold">
                    ✕
                  </div>
                  <div>
                    <h4 className="font-display text-[14.5px] font-bold text-red-950">
                      Update Failed
                    </h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-red-900 font-mono font-semibold">
                      {getErrorMessage(updateMutation.error || deleteMutation.error)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateMutation.reset();
                    deleteMutation.reset();
                  }}
                  className="rounded-lg border border-red-400 bg-white px-3 py-1 text-xs font-bold text-red-950 hover:bg-red-100 transition-colors shadow-sm cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {/* Customer Cancellation Banner */}
          {order.cancelReason ? (
            <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-4 text-red-950 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-200 text-red-900 text-sm font-bold">
                  ✕
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-display text-[14px] font-bold text-red-950">
                      Order Cancelled by Customer
                    </h4>
                    <span className="rounded-full border border-red-400 bg-red-200 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-red-950">
                      Cancelled
                    </span>
                  </div>
                  <p className="text-[12.5px] text-red-950/90 font-medium whitespace-pre-wrap">
                    Reason: {order.cancelReason.replace(/^Customer cancelled order:\s*/i, "")}
                  </p>
                </div>
              </div>
            </div>
          ) : (order.orderStatus === "Cancelled" ||
              (order.orderStatus as string) === "CANCELLED") ? (
            <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-3.5 text-red-950 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="font-bold">✕</span>
                <span className="text-[13px] font-semibold text-red-950">
                  This order is cancelled. Quantities were automatically restored to inventory.
                </span>
              </div>
            </div>
          ) : null}

          {/* Customer Return Request Banner */}
          {order.returnReason ? (
            <div className="rounded-2xl border-2 border-orange-400 bg-orange-50 p-4 text-orange-950 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-200 text-orange-900 text-sm font-bold">
                  ↩
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-display text-[14px] font-bold text-orange-950">
                      Customer Return Requested
                    </h4>
                    <span className="rounded-full border border-orange-400 bg-orange-200 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-orange-950">
                      Action Required
                    </span>
                  </div>
                  <p className="text-[12.5px] text-orange-950 font-medium whitespace-pre-wrap">
                    Reason: {order.returnReason.replace(/^Customer requested return:\s*/i, "")}
                  </p>
                  <p className="text-[11.5px] text-orange-900/90 font-medium">
                    Click <strong>Return Approved</strong> below to automatically schedule reverse pickup with Shiprocket.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {invoiceError && (
            <div className="rounded-2xl border border-red-400/80 bg-red-50 p-3 text-red-950 shadow-sm flex items-center justify-between gap-3">
              <span className="text-xs font-semibold">{invoiceError}</span>
              <button
                type="button"
                onClick={() => setInvoiceError(null)}
                className="text-xs font-bold text-red-900 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Header Overview Card */}
          <div className="rounded-2xl border border-line bg-surface/30 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-paper">
                  {order.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="rounded-md border border-line px-2 py-0.5 text-[10px] font-semibold text-paper-muted hover:border-gold hover:text-gold transition-colors cursor-pointer"
                  title="Copy full order ID"
                >
                  {copiedId ? "Copied!" : "Copy"}
                </button>
              </div>
              <span className="text-xs text-paper-muted">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] border ${
                  isCod
                    ? "border-amber-400 bg-amber-100 text-amber-950"
                    : "border-sky-400 bg-sky-100 text-sky-950"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isCod ? "bg-amber-600" : "bg-sky-600"
                  }`}
                />
                {isCod ? "COD" : "UPI"}
              </span>
              <StatusBadge kind="payment" status={draft.paymentStatus} />
              <StatusBadge kind="order" status={draft.orderStatus} />

              <button
                type="button"
                disabled={syncMutation.isPending}
                onClick={() => {
                  syncMutation.mutate(order.id, {
                    onSuccess: (updated) => {
                      adminToast.success(
                        "Shiprocket tracking synchronized successfully.",
                        "Tracking Synced",
                      );
                      if (updated) {
                        setDraft(buildDraft(updated));
                      }
                    },
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gold hover:bg-gold hover:text-white transition-all disabled:opacity-50 cursor-pointer"
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

              <button
                type="button"
                disabled={downloadingInvoice}
                onClick={handleDownloadInvoice}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-paper-muted hover:border-gold hover:text-gold transition-all disabled:opacity-50 cursor-pointer"
                title="Download official Tax Invoice PDF"
              >
                <svg
                  className={`h-3 w-3 ${downloadingInvoice ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {downloadingInvoice ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  )}
                </svg>
                {downloadingInvoice ? "PDF..." : "Invoice"}
              </button>

              {/* Shipping label & manifest actions if available from Shiprocket */}
              {order.trackingCode && (
                <>
                  <button
                    type="button"
                    disabled={getShippingLabelMutation.isPending}
                    onClick={async () => {
                      try {
                        const res = await getShippingLabelMutation.mutateAsync(order.id);
                        if (res?.labelUrl) {
                          window.open(res.labelUrl, "_blank", "noopener,noreferrer");
                        }
                      } catch {
                        adminToast.error("Could not fetch shipping label.");
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-surface/60 px-2.5 py-1 text-[11px] font-semibold text-paper hover:border-gold hover:text-gold transition-colors cursor-pointer"
                  >
                    Print Label
                  </button>
                  <button
                    type="button"
                    disabled={getManifestMutation.isPending}
                    onClick={async () => {
                      try {
                        const res = await getManifestMutation.mutateAsync(order.id);
                        if (res?.manifestUrl) {
                          window.open(res.manifestUrl, "_blank", "noopener,noreferrer");
                        }
                      } catch {
                        adminToast.error("Could not fetch shipping manifest.");
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-surface/60 px-2.5 py-1 text-[11px] font-semibold text-paper hover:border-gold hover:text-gold transition-colors cursor-pointer"
                  >
                    Manifest
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SIMPLIFIED STATUS PROGRESSION (NO REDUNDANT DROPDOWN) */}
          <div className="rounded-2xl border border-line bg-surface/40 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-line/60">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-paper">
                  Order Status
                </span>
                <span className="text-paper-muted">·</span>
                <span className="text-xs text-paper-muted">Current:</span>
                <StatusBadge kind="order" status={order.orderStatus} />
              </div>
              {draft.orderStatus !== order.orderStatus && (
                <button
                  type="button"
                  onClick={() =>
                    setDraft((d) =>
                      d ? { ...d, orderStatus: order.orderStatus } : d,
                    )
                  }
                  className="text-xs font-semibold text-gold hover:underline cursor-pointer"
                >
                  Reset to {order.orderStatus}
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3.5">
              {allowedNextStatuses.length === 0 ? (
                <div className="rounded-xl border border-line/70 bg-ink-2/60 p-3.5 text-xs text-paper-muted flex items-center gap-2.5">
                  <span className="text-base">🔒</span>
                  <span>
                    Order is in a final state (<strong>{order.orderStatus}</strong>). No further status modifications are available.
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <span className="text-[11.5px] font-semibold text-paper">
                      Allowed Next Steps:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((d) =>
                            d ? { ...d, orderStatus: order.orderStatus } : d,
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          draft.orderStatus === order.orderStatus
                            ? "bg-paper/20 text-paper border border-paper/40 shadow-sm"
                            : "border border-line bg-surface/50 text-paper-muted hover:bg-surface hover:text-paper"
                        }`}
                      >
                        <span>
                          {draft.orderStatus === order.orderStatus ? "●" : "○"}
                        </span>
                        <span>Keep {order.orderStatus}</span>
                      </button>

                      {allowedNextStatuses.map((nextSt) => {
                        const isSelected = draft.orderStatus === nextSt;
                        const isCancel = nextSt === "Cancelled";
                        return (
                          <button
                            key={nextSt}
                            type="button"
                            onClick={() =>
                              setDraft((d) =>
                                d
                                  ? { ...d, orderStatus: nextSt as OrderStatus }
                                  : d,
                              )
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? isCancel
                                  ? "bg-red-700 text-white shadow-sm ring-2 ring-red-400"
                                  : "bg-gold text-ink font-bold shadow-sm ring-2 ring-amber-300"
                                : isCancel
                                ? "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                                : "border border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                            }`}
                          >
                            <span>{isSelected ? "✓" : "→"}</span>
                            <span>{nextSt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {draft.orderStatus !== order.orderStatus && (
                    <div className="rounded-xl border border-gold/40 bg-gold/10 px-3.5 py-2.5 text-xs text-gold flex items-center justify-between gap-2 mt-1">
                      <div className="flex items-center gap-2">
                        <span>Status change selected:</span>
                        <span className="font-semibold">{order.orderStatus}</span>
                        <span>➔</span>
                        <span className="font-bold underline">{draft.orderStatus}</span>
                      </div>
                      <span className="text-[11px] text-paper-muted">
                        Click &quot;Save changes&quot; below to apply
                      </span>
                    </div>
                  )}

                  {(draft.orderStatus === "Return Approved" ||
                    (draft.orderStatus as string) === "RETURN_APPROVED") && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[12px] text-amber-300">
                      <span className="font-semibold">Reverse Logistics Notice:</span> Saving as &quot;Return Approved&quot; automatically creates a reverse pickup in Shiprocket from customer address.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 2-COLUMN GRID: CUSTOMER & PAYMENT DETAILS */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Customer Information */}
            <div className="rounded-2xl border border-line bg-surface/30 p-4 sm:p-5 flex flex-col gap-4">
              <SectionTitle>Customer Details</SectionTitle>
              <FormField label="Customer Name">
                <input
                  type="text"
                  value={draft.customer.name}
                  onChange={(e) => setCustomer("name", e.target.value)}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Phone Number">
                <input
                  type="tel"
                  value={draft.customer.phone}
                  onChange={(e) => setCustomer("phone", e.target.value)}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Shipping Address">
                <textarea
                  rows={3}
                  value={draft.customer.address}
                  onChange={(e) => setCustomer("address", e.target.value)}
                  className={textareaClass}
                />
              </FormField>
            </div>

            {/* Payment & Billing */}
            <div className="rounded-2xl border border-line bg-surface/30 p-4 sm:p-5 flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-4">
                <SectionTitle>Payment & Billing</SectionTitle>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
                    Payment Method
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold tracking-wide uppercase border ${
                        isCod
                          ? "border-amber-400 bg-amber-100 text-amber-950"
                          : "border-sky-400 bg-sky-100 text-sky-950"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isCod ? "bg-amber-600" : "bg-sky-600"
                        }`}
                      />
                      {isCod ? "Cash on Delivery (COD)" : "UPI / Online Payment"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
                      Payment Status
                    </span>
                    {isCod && (
                      <span className="text-[10.5px] text-paper-muted italic">
                        (Mark Paid when cash is collected)
                      </span>
                    )}
                  </div>
                  <select
                    value={draft.paymentStatus}
                    onChange={(e) =>
                      setDraft((d) =>
                        d
                          ? {
                              ...d,
                              paymentStatus: e.target.value as PaymentStatus,
                            }
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
                </div>
              </div>

              {/* Financial Breakdown Card */}
              <div className="rounded-xl border border-line/60 bg-ink-2/60 p-3.5 space-y-2 text-[12.5px]">
                <div className="flex justify-between text-paper-muted">
                  <span>Items Subtotal:</span>
                  <span className="text-paper font-medium">
                    {formatPrice(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-paper-muted">
                  <span>Delivery Fee:</span>
                  <span className="text-paper font-medium">
                    {formatPrice(totals.delivery)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line/50 pt-2 text-[13.5px] font-bold">
                  <span className="text-paper">Total Amount:</span>
                  <span className="text-gold">{formatPrice(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCTS IN ORDER WITH CATALOG-VALIDATED SIZES, COLORS & QUANTITY LIMITS */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SectionTitle>Products in Order</SectionTitle>
                {!isItemEditable && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface/50 px-2.5 py-0.5 text-[10.5px] font-semibold text-paper-muted">
                    <span>🔒</span> Locked ({order.orderStatus})
                  </span>
                )}
              </div>
              <span className="text-[12px] text-paper-muted">
                {draft.items.reduce((s, it) => s + it.quantity, 0)} item(s)
              </span>
            </div>
            {draft.items.length === 0 ? (
              <p className="rounded-2xl border border-line bg-surface/30 p-4 text-[13px] text-paper-muted">
                All items removed — save to record an empty order or cancel.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {draft.items.map((it, idx) => {
                  // Find catalog product to extract only actual in-stock sizes and colors
                  const matchingProduct = catalogProducts.find(
                    (p) =>
                      p.id === it.productId ||
                      p.title === it.name ||
                      p.slug === it.productId,
                  );

                  // Helper to safely get available stock for any variant
                  const getVStock = (v: { stock?: number; inventory?: { available?: number } }): number =>
                    v.inventory?.available ?? v.stock ?? 0;

                  // Extract strictly available colors for this product
                  const availableColors: string[] = (() => {
                    if (!matchingProduct || !matchingProduct.variants?.length) {
                      return it.color ? [it.color] : [];
                    }
                    const set = new Set<string>();
                    matchingProduct.variants.forEach((v) => {
                      if (v.color && (getVStock(v) > 0 || v.color.toLowerCase() === it.color.toLowerCase())) {
                        set.add(v.color);
                      }
                    });
                    if (it.color) set.add(it.color);
                    return Array.from(set);
                  })();

                  // Extract strictly available sizes for this product & currently selected color
                  const availableSizes: string[] = (() => {
                    if (!matchingProduct || !matchingProduct.variants?.length) {
                      return it.size ? [it.size] : [];
                    }
                    const set = new Set<string>();
                    matchingProduct.variants.forEach((v) => {
                      const matchesColor =
                        !it.color ||
                        v.color.toLowerCase() === it.color.toLowerCase();
                      if (matchesColor && (getVStock(v) > 0 || v.size.toLowerCase() === it.size.toLowerCase())) {
                        if (v.size) set.add(v.size);
                      }
                    });
                    if (set.size === 0) {
                      matchingProduct.variants.forEach((v) => {
                        if (v.size && (getVStock(v) > 0 || v.size.toLowerCase() === it.size.toLowerCase())) {
                          set.add(v.size);
                        }
                      });
                    }
                    if (it.size) set.add(it.size);
                    return Array.from(set);
                  })();

                  // Compute available stock for this variant
                  const currentVariant = matchingProduct?.variants?.find(
                    (v) =>
                      v.size.toLowerCase() === it.size.toLowerCase() &&
                      v.color.toLowerCase() === it.color.toLowerCase(),
                  );
                  const availableStock = currentVariant ? getVStock(currentVariant) : null;
                  const maxAllowedQty =
                    availableStock !== null
                      ? Math.max(it.quantity, availableStock)
                      : 99;

                  const handleColorSelect = (newColor: string) => {
                    // Update color and adjust size/qty to variant limits
                    const sizesForColor = matchingProduct?.variants
                      ?.filter(
                        (v) =>
                          v.color.toLowerCase() === newColor.toLowerCase() &&
                          getVStock(v) > 0,
                      )
                      .map((v) => v.size) || [];
                    let newSize = it.size;
                    if (sizesForColor.length > 0 && !sizesForColor.includes(it.size)) {
                      newSize = sizesForColor[0];
                    }
                    const newVar = matchingProduct?.variants?.find(
                      (v) =>
                        v.size.toLowerCase() === newSize.toLowerCase() &&
                        v.color.toLowerCase() === newColor.toLowerCase(),
                    );
                    const newMax = newVar ? getVStock(newVar) : 99;
                    const newQty = Math.min(it.quantity, Math.max(1, newMax));

                    setDraft((d) => {
                      if (!d) return d;
                      const items = d.items.map((item, i) =>
                        i === idx
                          ? {
                              ...item,
                              color: newColor,
                              size: newSize,
                              quantity: newQty,
                            }
                          : item,
                      );
                      return { ...d, items };
                    });
                  };

                  const handleSizeSelect = (newSize: string) => {
                    const newVar = matchingProduct?.variants?.find(
                      (v) =>
                        v.size.toLowerCase() === newSize.toLowerCase() &&
                        v.color.toLowerCase() === it.color.toLowerCase(),
                    );
                    const newMax = newVar
                      ? (newVar.inventory?.available ?? newVar.stock ?? 1)
                      : 99;
                    const newQty = Math.min(it.quantity, Math.max(1, newMax));

                    setDraft((d) => {
                      if (!d) return d;
                      const items = d.items.map((item, i) =>
                        i === idx
                          ? { ...item, size: newSize, quantity: newQty }
                          : item,
                      );
                      return { ...d, items };
                    });
                  };

                  return (
                    <li
                      key={`${it.productId}-${idx}`}
                      className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/30 p-4 sm:flex-row sm:items-start"
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
                          <p className="text-[13.5px] font-medium text-paper">
                            {it.name}
                          </p>
                          <p className="text-[11.5px] text-paper-muted">
                            {formatPrice(it.price)} each ·{" "}
                            {formatPrice(it.price * it.quantity)} line total
                          </p>
                        </div>
                        {isItemEditable ? (
                          <div className="grid grid-cols-3 gap-2">
                            {/* Color Dropdown strictly limited to available product colors */}
                            <FormField label="Color">
                              <select
                                value={it.color}
                                onChange={(e) => handleColorSelect(e.target.value)}
                                className={selectClass}
                              >
                                {availableColors.map((c) => (
                                  <option key={c} value={c} className="bg-ink">
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </FormField>

                            {/* Size Dropdown strictly limited to available sizes for this product/color */}
                            <FormField label="Size">
                              <select
                                value={it.size}
                                onChange={(e) => handleSizeSelect(e.target.value)}
                                className={selectClass}
                              >
                                {availableSizes.map((s) => (
                                  <option key={s} value={s} className="bg-ink">
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </FormField>

                            {/* Quantity Input bounded by actual inventory */}
                            <FormField
                              label={`Qty${
                                availableStock !== null
                                  ? ` (Stock: ${availableStock})`
                                  : ""
                              }`}
                            >
                              <input
                                type="number"
                                min={1}
                                max={maxAllowedQty}
                                value={it.quantity}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 1;
                                  const clamped = Math.min(
                                    maxAllowedQty,
                                    Math.max(1, val),
                                  );
                                  setDraft((d) => {
                                    if (!d) return d;
                                    const items = d.items.map((item, i) =>
                                      i === idx
                                        ? { ...item, quantity: clamped }
                                        : item,
                                    );
                                    return { ...d, items };
                                  });
                                }}
                                className={inputClass}
                              />
                            </FormField>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            <span className="rounded-lg border border-line bg-surface/50 px-3 py-1 font-medium text-paper">
                              Size: <strong className="text-gold font-bold">{it.size}</strong>
                            </span>
                            <span className="rounded-lg border border-line bg-surface/50 px-3 py-1 font-medium text-paper">
                              Color: <strong className="text-gold font-bold">{it.color}</strong>
                            </span>
                            <span className="rounded-lg border border-line bg-surface/50 px-3 py-1 font-medium text-paper">
                              Quantity: <strong className="text-gold font-bold">{it.quantity}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {isItemEditable && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="self-start rounded-full border border-line px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-muted transition-colors hover:border-[#B3261E] hover:text-[#B3261E] cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* SUMMARY */}
          <section className="flex flex-col gap-3 pt-2">
            <dl className="flex flex-col gap-2 rounded-2xl border border-line bg-surface/30 p-4 text-[13px]">
              <SummaryRow
                label="Subtotal"
                value={formatPrice(totals.subtotal)}
              />
              <SummaryRow
                label="Delivery fee"
                value={formatPrice(totals.delivery)}
              />
              <SummaryRow
                label="Payment mode"
                value={isCod ? "COD (Cash on Delivery)" : "UPI"}
              />
              <SummaryRow
                label="Total"
                value={formatPrice(totals.total)}
                emphasise
              />
            </dl>
          </section>

          {/* FOOTER BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <Button
              variant="dark"
              size="sm"
              disabled={isBusy}
              onClick={() => setConfirmDelete(true)}
              className="!bg-[#B3261E] !text-white hover:!bg-[#92201A]"
            >
              Delete order
            </Button>
            <div className="flex items-center gap-2.5">
              <Button
                variant="dark"
                size="sm"
                disabled={isBusy}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={updateMutation.isPending}
                disabled={isBusy}
                onClick={handleSave}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        loading={deleteMutation.isPending}
        title="Delete this order?"
        description={`Order ${order.id} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete order"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
        danger
      />
    </>
  );
}
