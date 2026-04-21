import type { OrderStatus, PaymentStatus } from "@/data/orders";

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
  Pending: {
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
  "In Transit": {
    border: "border-[#8B5CF6]/40",
    bg: "bg-[#8B5CF6]/10",
    text: "text-[#A78BFA]",
    dot: "bg-[#8B5CF6]",
  },
  Delivered: {
    border: "border-[#16A34A]/40",
    bg: "bg-[#16A34A]/10",
    text: "text-[#16A34A]",
    dot: "bg-[#16A34A]",
  },
  "Return Requested": {
    border: "border-[#F97316]/40",
    bg: "bg-[#F97316]/10",
    text: "text-[#F97316]",
    dot: "bg-[#F97316]",
  },
  "Return In Progress": {
    border: "border-[#F97316]/40",
    bg: "bg-[#F97316]/10",
    text: "text-[#F97316]",
    dot: "bg-[#F97316]",
  },
  "Return Completed": {
    border: "border-[#F97316]/40",
    bg: "bg-[#F97316]/10",
    text: "text-[#FB923C]",
    dot: "bg-[#F97316]",
  },
  "Refund Initiated": {
    border: "border-[#DC2626]/40",
    bg: "bg-[#DC2626]/10",
    text: "text-[#F87171]",
    dot: "bg-[#DC2626]",
  },
  "Refund Completed": {
    border: "border-[#DC2626]/40",
    bg: "bg-[#DC2626]/10",
    text: "text-[#F87171]",
    dot: "bg-[#DC2626]",
  },
  Cancelled: {
    border: "border-[#B3261E]/40",
    bg: "bg-[#B3261E]/10",
    text: "text-[#B3261E]",
    dot: "bg-[#B3261E]",
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
export default function StatusBadge(props: Props) {
  const tone =
    props.kind === "order"
      ? ORDER_STATUS_TONE[props.status]
      : PAYMENT_STATUS_TONE[props.status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${tone.border} ${tone.bg} ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {props.status}
    </span>
  );
}
