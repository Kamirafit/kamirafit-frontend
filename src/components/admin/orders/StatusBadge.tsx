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
    border: "border-[#EAB308]/40",
    bg: "bg-[#EAB308]/10",
    text: "text-[#EAB308]",
    dot: "bg-[#EAB308]",
  },
  Confirmed: {
    border: "border-[#2563EB]/40",
    bg: "bg-[#2563EB]/10",
    text: "text-[#60A5FA]",
    dot: "bg-[#2563EB]",
  },
  Processing: {
    border: "border-[#38BDF8]/40",
    bg: "bg-[#38BDF8]/10",
    text: "text-[#38BDF8]",
    dot: "bg-[#38BDF8]",
  },
  "Ready to Ship": {
    border: "border-[#818CF8]/40",
    bg: "bg-[#818CF8]/10",
    text: "text-[#818CF8]",
    dot: "bg-[#818CF8]",
  },
  "Pickup Scheduled": {
    border: "border-[#A855F7]/40",
    bg: "bg-[#A855F7]/10",
    text: "text-[#C084FC]",
    dot: "bg-[#A855F7]",
  },
  "Picked Up": {
    border: "border-[#8B5CF6]/40",
    bg: "bg-[#8B5CF6]/10",
    text: "text-[#A78BFA]",
    dot: "bg-[#8B5CF6]",
  },
  "In Transit": {
    border: "border-[#8B5CF6]/40",
    bg: "bg-[#8B5CF6]/10",
    text: "text-[#A78BFA]",
    dot: "bg-[#8B5CF6]",
  },
  "Out For Delivery": {
    border: "border-[#06B6D4]/40",
    bg: "bg-[#06B6D4]/10",
    text: "text-[#22D3EE]",
    dot: "bg-[#06B6D4]",
  },
  Delivered: {
    border: "border-[#16A34A]/40",
    bg: "bg-[#16A34A]/10",
    text: "text-[#16A34A]",
    dot: "bg-[#16A34A]",
  },
  Cancelled: {
    border: "border-[#B3261E]/40",
    bg: "bg-[#B3261E]/10",
    text: "text-[#B3261E]",
    dot: "bg-[#B3261E]",
  },
  "RTO Initiated": {
    border: "border-[#F97316]/40",
    bg: "bg-[#F97316]/10",
    text: "text-[#F97316]",
    dot: "bg-[#F97316]",
  },
  "RTO Delivered": {
    border: "border-[#EA580C]/40",
    bg: "bg-[#EA580C]/10",
    text: "text-[#FB923C]",
    dot: "bg-[#EA580C]",
  },
  "Return Requested": {
    border: "border-[#F97316]/40",
    bg: "bg-[#F97316]/10",
    text: "text-[#F97316]",
    dot: "bg-[#F97316]",
  },
  "Return Approved": {
    border: "border-[#D97706]/40",
    bg: "bg-[#D97706]/10",
    text: "text-[#F59E0B]",
    dot: "bg-[#D97706]",
  },
  Returned: {
    border: "border-[#EA580C]/40",
    bg: "bg-[#EA580C]/10",
    text: "text-[#FB923C]",
    dot: "bg-[#EA580C]",
  },
  Refunded: {
    border: "border-[#DC2626]/40",
    bg: "bg-[#DC2626]/10",
    text: "text-[#F87171]",
    dot: "bg-[#DC2626]",
  },
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  Paid: {
    border: "border-[#16A34A]/40",
    bg: "bg-[#16A34A]/10",
    text: "text-[#16A34A]",
    dot: "bg-[#16A34A]",
  },
  Pending: {
    border: "border-[#EAB308]/40",
    bg: "bg-[#EAB308]/10",
    text: "text-[#EAB308]",
    dot: "bg-[#EAB308]",
  },
  Failed: {
    border: "border-[#B3261E]/40",
    bg: "bg-[#B3261E]/10",
    text: "text-[#B3261E]",
    dot: "bg-[#B3261E]",
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
