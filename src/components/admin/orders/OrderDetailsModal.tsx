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
  useGetAdminOrderShippingLabel,
  useGetAdminOrderManifest,
  useColors,
} from "@/services/admin";
import { COLOR_OPTIONS, SIZE_OPTIONS } from "@/features/product/types";
import { orderService } from "@/services/order";
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

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  New: ["Confirmed", "Processing", "Ready to Ship", "Cancelled"],
  Confirmed: ["Processing", "Ready to Ship", "Shipped", "Cancelled"],
  CONFIRMED: ["Processing", "Ready to Ship", "Shipped", "Cancelled"],
  Pending: ["Confirmed", "Cancelled"],
  PENDING_VERIFICATION: ["Confirmed", "Cancelled"],
  Processing: ["Ready to Ship", "Shipped", "Cancelled"],
  PROCESSING: ["Ready to Ship", "Shipped", "Cancelled"],
  "Ready to Ship": ["Shipped", "Out For Delivery", "Delivered", "Cancelled"],
  Packed: ["Shipped", "Out For Delivery", "Delivered", "Cancelled"],
  PACKED: ["Shipped", "Out For Delivery", "Delivered", "Cancelled"],
  "Pickup Scheduled": ["Ready to Ship", "Shipped", "Cancelled"],
  "Picked Up": ["Out For Delivery", "Delivered", "Cancelled"],
  "In Transit": ["Out For Delivery", "Delivered", "Cancelled"],
  Shipped: ["Out For Delivery", "Delivered", "Returned", "Cancelled"],
  SHIPPED: ["Out For Delivery", "Delivered", "Returned", "Cancelled"],
  "Out For Delivery": ["Delivered", "Returned", "Cancelled"],
  OUT_FOR_DELIVERY: ["Delivered", "Returned", "Cancelled"],
  Delivered: ["Return Requested", "Returned", "Cancelled"],
  DELIVERED: ["Return Requested", "Returned", "Cancelled"],
  "Return Requested": ["Return Approved", "Returned", "Cancelled"],
  RETURN_REQUESTED: ["Return Approved", "Returned", "Cancelled"],
  "Return Approved": ["Returned", "Cancelled"],
  RETURN_APPROVED: ["Returned", "Cancelled"],
  "RTO Initiated": ["RTO Delivered", "Returned", "Cancelled"],
  "RTO Delivered": ["Refunded"],
  Returned: ["Refunded"],
  RETURNED: ["Refunded"],
  "Return Completed": ["Refunded"],
  RETURN_COMPLETED: ["Refunded"],
  "Return In Progress": ["Returned", "Return Completed", "Refunded", "Cancelled"],
  RETURN_IN_PROGRESS: ["Returned", "Return Completed", "Refunded", "Cancelled"],
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
  const fulfillMutation = useFulfillAdminOrder();
  const deleteMutation = useDeleteAdminOrder();
  const syncMutation = useSyncAdminOrderWithShiprocket();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showFulfillSection, setShowFulfillSection] = useState(false);
  const [logisticsError, setLogisticsError] = useState<string | null>(null);
  const [showFlowGuide, setShowFlowGuide] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const syncShiprocketMutation = useSyncAdminOrderWithShiprocket();
  const getShippingLabelMutation = useGetAdminOrderShippingLabel();
  const getManifestMutation = useGetAdminOrderManifest();
  const colorsQuery = useColors();

  const colorList = useMemo(() => {
    const set = new Set<string>();
    (colorsQuery.data || []).forEach((c) => {
      if (c.name) set.add(c.name);
    });
    COLOR_OPTIONS.forEach((c) => set.add(c));
    return Array.from(set);
  }, [colorsQuery.data]);

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

  const allowedNextStatuses = useMemo(() => {
    return order ? getAllowedTransitions(order.orderStatus) : [];
  }, [order]);

  const isTransitionAllowed = useMemo(() => {
    if (!draft || !order) return true;
    if (draft.orderStatus === order.orderStatus) return true;
    return allowedNextStatuses.includes(draft.orderStatus);
  }, [draft, order, allowedNextStatuses]);

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
    deleteMutation.mutate(order.id, {
      onSuccess: () => {
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
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setInvoiceError(
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to download tax invoice."
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
        maxWidth="lg"
      >
        <div className="flex flex-col gap-8">
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
                    <p className="mt-1.5 text-[12px] text-red-800 font-medium">
                      Please check the allowed transitions guide below or follow sequential fulfillment rules.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateMutation.reset();
                    deleteMutation.reset();
                  }}
                  className="rounded-lg border border-red-400 bg-white px-3 py-1 text-xs font-bold text-red-950 hover:bg-red-100 transition-colors shadow-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}
          {order.returnReason ? (
            <div className="rounded-2xl border-2 border-orange-400 bg-orange-50 p-4.5 text-orange-950 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-200 text-orange-900 text-base font-bold">
                  ↩
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-display text-[15px] font-bold text-orange-950">
                      Customer Return Request
                    </h4>
                    <span className="rounded-full border border-orange-400 bg-orange-200 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-orange-950">
                      Action Required
                    </span>
                  </div>
                  <div className="rounded-xl border border-orange-300 bg-white/95 p-3.5 shadow-inner">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-orange-900 mb-1">
                      Reason Given by Customer:
                    </p>
                    <p className="text-[13.5px] leading-relaxed text-orange-950 font-semibold whitespace-pre-wrap">
                      {order.returnReason}
                    </p>
                  </div>
                  <p className="text-[12px] text-orange-900 font-medium">
                    💡 If approved, update status to <strong>Return Approved</strong> below. This will automatically schedule reverse pickup via Shiprocket.
                  </p>
                </div>
              </div>
            </div>
          ) : (order.orderStatus === "Return Requested" || (order.orderStatus as string) === "RETURN_REQUESTED") ? (
            <div className="rounded-2xl border-2 border-orange-400 bg-orange-50 p-4 text-orange-950 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-200 text-orange-900 text-base font-bold">
                  ↩
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-display text-[15px] font-bold text-orange-950">
                    Customer Return Requested
                  </h4>
                  <p className="text-[13px] text-orange-900 font-medium">
                    Customer has requested a return and refund for this order within the 7-day window.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {invoiceError && (
            <div className="rounded-2xl border border-red-400/80 bg-red-50 p-3.5 text-red-950 shadow-sm flex items-center justify-between gap-3">
              <span className="text-xs font-semibold">{invoiceError}</span>
              <button
                type="button"
                onClick={() => setInvoiceError(null)}
                className="text-xs font-bold text-red-900 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle>Order info</SectionTitle>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={downloadingInvoice}
                  onClick={handleDownloadInvoice}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gold hover:bg-gold hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                  title="Generate and download Tax Invoice PDF"
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
                  {downloadingInvoice ? "Downloading..." : "Tax Invoice"}
                </button>
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
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] border ${
                    isCod
                      ? "border-amber-400 bg-amber-100 text-amber-950"
                      : "border-sky-400 bg-sky-100 text-sky-950"
                  }`}
                  title={`Payment Mode: ${isCod ? "COD" : "UPI"}`}
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
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper-muted">
                  Payment Mode
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
                    {isCod ? "Cash on Delivery (COD)" : "UPI"}
                  </span>
                </div>
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
              <div className="sm:col-span-2 flex flex-col gap-3 rounded-2xl border border-line/60 bg-surface/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper">
                      Order Status & Transition Control
                    </span>
                    <span className="text-[10px] text-paper-muted">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-paper-muted">Current:</span>
                      <StatusBadge kind="order" status={order.orderStatus} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFlowGuide((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-100 px-3 py-1 text-[11.5px] font-bold text-amber-950 hover:bg-amber-200 transition-all"
                  >
                    <span>{showFlowGuide ? "▲ Hide Lifecycle Instructions" : "▼ View Status Guide & Order Flow"}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium text-paper-muted">
                    Change Status To:
                  </label>
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
                    <optgroup label="── Recommended Next Transitions ──">
                      <option value={order.orderStatus} className="bg-ink font-semibold">
                        {order.orderStatus} (Keep Current Status)
                      </option>
                      {allowedNextStatuses.map((s) => (
                        <option key={s} value={s} className="bg-ink text-gold font-medium">
                          ✓ {s} (Allowed Next Step)
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="── Other Lifecycle Statuses (May Fail Validation) ──">
                      {ORDER_STATUSES.filter(
                        (s) =>
                          s !== order.orderStatus &&
                          !allowedNextStatuses.includes(s),
                      ).map((s) => (
                        <option key={s} value={s} className="bg-ink text-paper-muted">
                          {s}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {allowedNextStatuses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line/40">
                    <span className="text-[11.5px] font-semibold text-paper">
                      Quick Next Action:
                    </span>
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
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-bold transition-all ${
                            isSelected
                              ? isCancel
                                ? "bg-red-800 text-white shadow-sm ring-2 ring-red-400"
                                : "bg-stone-900 text-white shadow-sm ring-2 ring-amber-500"
                              : isCancel
                              ? "border border-red-300 bg-red-100 text-red-950 hover:bg-red-200"
                              : "border border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200"
                          }`}
                        >
                          <span>{isSelected ? "●" : "→"}</span>
                          <span>{nextSt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {!isTransitionAllowed && (
                  <div className="rounded-xl border border-amber-400 bg-amber-50 p-3 text-amber-950 shadow-sm">
                    <div className="flex items-center gap-2 text-[12.5px] font-bold text-amber-950">
                      <span>⚠️ Irregular Status Transition Selected</span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-amber-950 font-medium">
                      You are changing from <strong>&quot;{order.orderStatus}&quot;</strong> directly to <strong>&quot;{draft.orderStatus}&quot;</strong>. Standard orders follow a sequential path: <code className="rounded bg-amber-200/90 px-1 py-0.5 font-mono text-amber-950 font-bold">Confirmed ➔ Processing ➔ Ready to Ship ➔ Shipped ➔ Out For Delivery ➔ Delivered</code>. Saving non-standard jumps may trigger a server validation error.
                    </p>
                  </div>
                )}

                {showFlowGuide && (
                  <div className="rounded-xl border border-line/60 bg-surface-raised p-4 text-[12px] text-paper-muted space-y-3 mt-1 shadow-inner">
                    <div className="flex items-center justify-between border-b border-line/40 pb-2">
                      <span className="font-semibold text-paper text-[12.5px] flex items-center gap-1.5">
                        <span>📋</span> How Status Changes Work & Lifecycle Rules
                      </span>
                      <span className="text-[10.5px] uppercase tracking-wider text-gold font-medium">Fulfillment Lifecycle</span>
                    </div>

                    <div>
                      <span className="block font-medium text-paper text-[11.5px] mb-1.5">
                        1. Standard Forward Fulfillment Path:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-paper">
                        <span className="rounded bg-paper/10 px-2 py-0.5 border border-line/50">Confirmed / New</span>
                        <span className="text-gold">➔</span>
                        <span className="rounded bg-paper/10 px-2 py-0.5 border border-line/50">Processing</span>
                        <span className="text-gold">➔</span>
                        <span className="rounded bg-paper/10 px-2 py-0.5 border border-line/50">Ready to Ship</span>
                        <span className="text-gold">➔</span>
                        <span className="rounded bg-paper/10 px-2 py-0.5 border border-line/50">Shipped</span>
                        <span className="text-gold">➔</span>
                        <span className="rounded bg-paper/10 px-2 py-0.5 border border-line/50">Out For Delivery</span>
                        <span className="text-gold">➔</span>
                        <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 font-semibold">Delivered</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-line/30">
                      <div className="rounded-lg bg-red-50/90 p-2.5 border border-red-300 text-red-950">
                        <span className="block font-bold text-red-950 text-[11.5px] mb-1">
                          ✕ Cancellation Rules:
                        </span>
                        <p className="text-[11px] leading-relaxed text-red-950/90 font-medium">
                          Orders can be cancelled prior to dispatch (<span className="font-bold">Confirmed</span>, <span className="font-bold">Processing</span>, or <span className="font-bold">Ready to Ship</span>). Once marked Shipped or In Transit, cancellation is blocked. Cancellation automatically restores all product quantities to inventory.
                        </p>
                      </div>

                      <div className="rounded-lg bg-sky-50/90 p-2.5 border border-sky-300 text-sky-950">
                        <span className="block font-bold text-sky-950 text-[11.5px] mb-1">
                          🔄 Returns & Refunds:
                        </span>
                        <p className="text-[11px] leading-relaxed text-sky-950/90 font-medium">
                          Only applicable after <span className="font-bold">Delivered</span>:
                          <br />
                          <span className="font-mono font-bold">Return Requested</span> ➔ <span className="font-mono font-bold">Return Approved</span> (triggers automated Shiprocket reverse pickup) ➔ <span className="font-mono font-bold">Returned</span> (auto-restocks inventory) ➔ <span className="font-mono font-bold text-emerald-800">Refunded</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {(draft.orderStatus === "Return Approved" || (draft.orderStatus as string) === "RETURN_APPROVED") && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[12.5px] text-amber-300">
                <span className="font-semibold">Reverse Logistics Notice:</span> Saving as &quot;Return Approved&quot; automatically triggers reverse pickup creation in Shiprocket from the customer&apos;s address to your returns warehouse.
              </div>
            )}
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
              <div className="flex items-center gap-2">
                {(order.trackingCode || draft.trackingCode) && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={getShippingLabelMutation.isPending}
                      onClick={async () => {
                        setLogisticsError(null);
                        try {
                          const res = await getShippingLabelMutation.mutateAsync(order.id);
                          if (res?.labelUrl) {
                            window.open(res.labelUrl, "_blank", "noopener,noreferrer");
                          }
                        } catch (err: unknown) {
                          setLogisticsError(
                            err instanceof Error ? err.message : "Failed to download shipping label"
                          );
                        }
                      }}
                    >
                      {getShippingLabelMutation.isPending ? "Generating..." : "Print Label"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={getManifestMutation.isPending}
                      onClick={async () => {
                        setLogisticsError(null);
                        try {
                          const res = await getManifestMutation.mutateAsync(order.id);
                          if (res?.manifestUrl) {
                            window.open(res.manifestUrl, "_blank", "noopener,noreferrer");
                          }
                        } catch (err: unknown) {
                          setLogisticsError(
                            err instanceof Error ? err.message : "Failed to download manifest"
                          );
                        }
                      }}
                    >
                      {getManifestMutation.isPending ? "Generating..." : "Print Manifest"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={syncShiprocketMutation.isPending}
                      onClick={() => {
                        setLogisticsError(null);
                        syncShiprocketMutation.mutate(order.id);
                      }}
                    >
                      {syncShiprocketMutation.isPending ? "Syncing..." : "Sync Tracking"}
                    </Button>
                  </>
                )}
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
            </div>

            {logisticsError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[12.5px] text-red-300">
                {logisticsError}
              </div>
            )}

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
                            {colorList.map((c) => (
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
                label="Payment mode"
                value={isCod ? "COD (Cash on Delivery)" : "UPI"}
              />
              <SummaryRow
                label="Total"
                value={formatPrice(totals.total)}
                emphasise
              />
            </dl>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-[11.5px] text-paper-muted">
                Totals recalculate live as you change items or quantities.
              </p>
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/50 bg-gold/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <svg
                  className={`h-3.5 w-3.5 ${downloadingInvoice ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {downloadingInvoice ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  )}
                </svg>
                {downloadingInvoice ? "Generating PDF..." : "Download Tax Invoice (PDF)"}
              </button>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5">
            <Button
              variant="dark"
              size="sm"
              disabled={isBusy}
              onClick={() => setConfirmDelete(true)}
              className="!bg-[#B3261E] !text-paper hover:!bg-[#92201A]"
            >
              Delete order
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="dark" size="sm" disabled={isBusy} onClick={onClose}>
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
        description={`Order ${order.id} will be removed from the admin. This cannot be undone.`}
        confirmLabel="Delete order"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
        danger
      />
    </>
  );
}
