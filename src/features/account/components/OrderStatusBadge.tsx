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
        containerClass: "bg-teal-100 text-teal-950 border border-teal-500 font-bold",
        dotClass: "bg-teal-600",
      };
    case "SHIPPED":
      return {
        label: "Shipped",
        containerClass: "bg-purple-100 text-purple-950 border border-purple-500 font-bold",
        dotClass: "bg-purple-600",
      };
    case "IN_TRANSIT":
      return {
        label: "In Transit",
        containerClass: "bg-violet-100 text-violet-950 border border-violet-500 font-bold",
        dotClass: "bg-violet-600",
      };
    case "DELIVERED":
      return {
        label: "Delivered",
        containerClass: "bg-emerald-100 text-emerald-950 border border-emerald-500 font-bold",
        dotClass: "bg-emerald-600",
      };
    case "CANCELLED":
    case "CANCELED":
      return {
        label: "Cancelled",
        containerClass: "bg-red-100 text-red-950 border border-red-500 font-bold",
        dotClass: "bg-red-600",
      };
    case "RETURN_REQUESTED":
      return {
        label: "Return Requested",
        containerClass: "bg-orange-100 text-orange-950 border border-orange-500 font-bold",
        dotClass: "bg-orange-600",
      };
    case "RETURN_APPROVED":
      return {
        label: "Return Approved",
        containerClass: "bg-rose-100 text-rose-950 border border-rose-500 font-bold",
        dotClass: "bg-rose-600",
      };
    case "RETURN_IN_PROGRESS":
      return {
        label: "Return In Progress",
        containerClass: "bg-amber-100 text-amber-950 border border-amber-600 font-bold",
        dotClass: "bg-amber-700",
      };
    case "RETURN_COMPLETED":
    case "RETURNED":
      return {
        label: "Returned",
        containerClass: "bg-amber-100 text-amber-950 border border-amber-700 font-bold",
        dotClass: "bg-amber-700",
      };
    case "REFUNDED":
    case "REFUND_INITIATED":
    case "REFUND_COMPLETED":
      return {
        label: norm === "REFUND_INITIATED" ? "Refund Initiated" : "Refunded",
        containerClass: "bg-fuchsia-100 text-fuchsia-950 border border-fuchsia-500 font-bold",
        dotClass: "bg-fuchsia-600",
      };
    case "CONFIRMED":
      return {
        label: "Confirmed",
        containerClass: "bg-blue-100 text-blue-950 border border-blue-500 font-bold",
        dotClass: "bg-blue-600",
      };
    case "PENDING":
      return {
        label: "Pending",
        containerClass: "bg-amber-100 text-amber-950 border border-amber-500 font-bold",
        dotClass: "bg-amber-600",
      };
    default:
      return {
        label: status || "Unknown",
        containerClass: "bg-stone-100 text-stone-900 border border-stone-300 font-bold",
        dotClass: "bg-stone-600",
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
