import React from "react";

interface Props {
  status: string;
  size?: "sm" | "md" | "lg";
}

export function getOrderStatusConfig(status: string) {
  const norm = (status || "").toUpperCase().replace(/[\s_-]+/g, "_");

  switch (norm) {
    case "PROCESSING":
      return {
        label: "Processing",
        containerClass: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        dotClass: "bg-amber-400",
      };
    case "SHIPPED":
      return {
        label: "Shipped",
        containerClass: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
        dotClass: "bg-sky-400",
      };
    case "IN_TRANSIT":
      return {
        label: "In Transit",
        containerClass: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
        dotClass: "bg-blue-400",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        containerClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        dotClass: "bg-emerald-400",
      };
    case "CANCELLED":
    case "CANCELED":
      return {
        label: "Cancelled",
        containerClass: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
        dotClass: "bg-rose-400",
      };
    case "RETURN_REQUESTED":
      return {
        label: "Return Requested",
        containerClass: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
        dotClass: "bg-purple-400",
      };
    case "RETURN_APPROVED":
      return {
        label: "Return Approved",
        containerClass: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
        dotClass: "bg-indigo-400",
      };
    case "RETURN_IN_PROGRESS":
      return {
        label: "Return In Progress",
        containerClass: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
        dotClass: "bg-violet-400",
      };
    case "RETURN_COMPLETED":
      return {
        label: "Return Completed",
        containerClass: "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30",
        dotClass: "bg-fuchsia-400",
      };
    case "REFUNDED":
    case "REFUND_INITIATED":
    case "REFUND_COMPLETED":
      return {
        label: norm === "REFUND_INITIATED" ? "Refund Initiated" : "Refunded",
        containerClass: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
        dotClass: "bg-orange-400",
      };
    case "CONFIRMED":
      return {
        label: "Confirmed",
        containerClass: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
        dotClass: "bg-cyan-400",
      };
    case "PENDING":
      return {
        label: "Pending",
        containerClass: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
        dotClass: "bg-yellow-400",
      };
    default:
      return {
        label: status || "Unknown",
        containerClass: "bg-paper-muted/15 text-paper-muted border border-paper-muted/30",
        dotClass: "bg-paper-muted",
      };
  }
}

export default function OrderStatusBadge({ status, size = "md" }: Props) {
  const { label, containerClass, dotClass } = getOrderStatusConfig(status);

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[10px] gap-1.5",
    md: "px-3 py-1 text-[11px] gap-2",
    lg: "px-4 py-1.5 text-[12px] gap-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider shadow-sm backdrop-blur-md ${sizeClasses} ${containerClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
