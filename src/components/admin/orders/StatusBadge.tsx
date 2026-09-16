import type { AdminOrderStatus as OrderStatus, PaymentStatus } from "@/types/entities";

type Tone = {
  /** Tailwind border color (e.g. "border-[#D97706]/40"). */
  border: string;
  /** Tailwind background color. */
  bg: string;
  /** Tailwind text color. */
  text: string;
  /** Solid dot color for the status indicator. */
  dot: string;
};

/**
 * Color keys per the brand spec:
 *  Pending        → Yellow
 *  Confirmed      → Blue
 *  In Transit     → Purple
 *  Delivered      → Green
 *  Return *       → Orange
 *  Refund *       → Red
 *  Cancelled      → Neutral / red
 *
 * Each palette is wine-friendly and tuned to read on the ink admin surface.
 */
const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  New: {
    border: "border-amber-500",
    bg: "bg-amber-100",
    text: "text-amber-950 font-bold",
    dot: "bg-amber-600",
  },
  Confirmed: {
    border: "border-blue-500",
    bg: "bg-blue-100",
    text: "text-blue-950 font-bold",
    dot: "bg-blue-600",
  },
  Processing: {
    border: "border-teal-500",
    bg: "bg-teal-100",
    text: "text-teal-950 font-bold",
    dot: "bg-teal-600",
  },
  "Ready to Ship": {
    border: "border-indigo-500",
    bg: "bg-indigo-100",
    text: "text-indigo-950 font-bold",
    dot: "bg-indigo-600",
  },
  "Pickup Scheduled": {
    border: "border-purple-500",
    bg: "bg-purple-100",
    text: "text-purple-950 font-bold",
    dot: "bg-purple-600",
  },
  "Picked Up": {
    border: "border-purple-500",
    bg: "bg-purple-100",
    text: "text-purple-950 font-bold",
    dot: "bg-purple-600",
  },
  "In Transit": {
    border: "border-violet-500",
    bg: "bg-violet-100",
    text: "text-violet-950 font-bold",
    dot: "bg-violet-600",
  },
  "Out For Delivery": {
    border: "border-cyan-500",
    bg: "bg-cyan-100",
    text: "text-cyan-950 font-bold",
    dot: "bg-cyan-600",
  },
  Delivered: {
    border: "border-emerald-500",
    bg: "bg-emerald-100",
    text: "text-emerald-950 font-bold",
    dot: "bg-emerald-600",
  },
  Cancelled: {
    border: "border-red-500",
    bg: "bg-red-100",
    text: "text-red-950 font-bold",
    dot: "bg-red-600",
  },
  "RTO Initiated": {
    border: "border-amber-600",
    bg: "bg-amber-100",
    text: "text-amber-950 font-bold",
    dot: "bg-amber-700",
  },
  "RTO Delivered": {
    border: "border-amber-700",
    bg: "bg-amber-100",
    text: "text-amber-950 font-bold",
    dot: "bg-amber-800",
  },
  "Return Requested": {
    border: "border-orange-500",
    bg: "bg-orange-100",
    text: "text-orange-950 font-bold",
    dot: "bg-orange-600",
  },
  "Return Approved": {
    border: "border-rose-500",
    bg: "bg-rose-100",
    text: "text-rose-950 font-bold",
    dot: "bg-rose-600",
  },
  Returned: {
    border: "border-amber-700",
    bg: "bg-amber-100",
    text: "text-amber-950 font-bold",
    dot: "bg-amber-700",
  },
  Refunded: {
    border: "border-fuchsia-500",
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-950 font-bold",
    dot: "bg-fuchsia-600",
  },
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  Paid: {
    border: "border-emerald-400",
    bg: "bg-emerald-100",
    text: "text-emerald-950",
    dot: "bg-emerald-600",
  },
  Pending: {
    border: "border-amber-400",
    bg: "bg-amber-100",
    text: "text-amber-950",
    dot: "bg-amber-600",
  },
  Failed: {
    border: "border-red-400",
    bg: "bg-red-100",
    text: "text-red-950",
    dot: "bg-red-600",
  },
};

type Props =
  | { kind: "order"; status: OrderStatus }
  | { kind: "payment"; status: PaymentStatus };

/**
 * Colored pill for Order Status / Payment Status cells in the admin table
 * and details modal. Palette is centralized here so any new status only
 * needs a tone entry added.
 */
const DEFAULT_TONE: Tone = {
  border: "border-paper-muted/30",
  bg: "bg-paper-muted/10",
  text: "text-paper-muted",
  dot: "bg-paper-muted",
};

export default function StatusBadge(props: Props) {
  const tone =
    (props.kind === "order"
      ? ORDER_STATUS_TONE[props.status]
      : PAYMENT_STATUS_TONE[props.status]) || DEFAULT_TONE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${tone.border} ${tone.bg} ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {props.status}
    </span>
  );
}
