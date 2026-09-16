"use client";

import React from "react";
import { Order } from "../types";

interface Props {
  order: Order;
  variant?: "compact" | "detailed";
  onTrackShipment?: () => void;
}

export default function OrderJourneyTimeline({
  order,
  variant = "compact",
  onTrackShipment,
}: Props) {
  const normStatus = (order.status || "").toUpperCase().replace(/[\s_-]+/g, "_");

  const customOrder = order as {
    createdAt?: string;
    updatedAt?: string;
    orderNumber?: string;
  };

  const isCancelled = normStatus === "CANCELLED" || normStatus === "CANCELED";

  const isReturnRelated = [
    "RETURN_REQUESTED",
    "RETURN_APPROVED",
    "RETURN_REJECTED",
    "RETURNED",
    "RETURN_IN_PROGRESS",
    "RETURN_COMPLETED",
    "REFUNDED",
    "REFUND_INITIATED",
    "REFUND_COMPLETED",
  ].includes(normStatus);

  // Delivery check & 7-day return calculation
  const isDelivered = normStatus === "DELIVERED" || isReturnRelated;
  const deliveredTimestamp = customOrder.updatedAt || customOrder.createdAt;
  const daysSinceDelivery = deliveredTimestamp
    ? Math.floor((Date.now() - new Date(deliveredTimestamp).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const isWithin7Days = daysSinceDelivery <= 7;
  const daysRemaining = Math.max(0, 7 - daysSinceDelivery);

  // Determine Forward Journey Step (0 to 4)
  // 0: Placed
  // 1: Confirmed
  // 2: Dispatched / Shipped
  // 3: Out for Delivery
  // 4: Delivered
  let forwardCurrentStep = 0;
  if (normStatus === "CONFIRMED" || normStatus === "PROCESSING" || normStatus === "PACKED") {
    forwardCurrentStep = 1;
  } else if (normStatus === "SHIPPED" || normStatus === "IN_TRANSIT") {
    forwardCurrentStep = 2;
  } else if (normStatus === "OUT_FOR_DELIVERY") {
    forwardCurrentStep = 3;
  } else if (isDelivered) {
    forwardCurrentStep = 4;
  }

  const forwardStages = [
    { key: "PLACED", label: "Placed", desc: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed", desc: "Payment & Order Verified" },
    { key: "SHIPPED", label: "Dispatched", desc: "Handed to Courier" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Out for Local Delivery" },
    { key: "DELIVERED", label: "Delivered", desc: "Delivered to You" },
  ];

  // Return Journey Stages (0 to 3)
  // 0: Return Requested
  // 1: Return Approved
  // 2: Picked Up / Returned
  // 3: Refund Processed
  let returnCurrentStep = 0;
  if (normStatus === "RETURN_APPROVED") {
    returnCurrentStep = 1;
  } else if (normStatus === "RETURNED" || normStatus === "RETURN_COMPLETED" || normStatus === "RETURN_IN_PROGRESS") {
    returnCurrentStep = 2;
  } else if (normStatus === "REFUNDED" || normStatus === "REFUND_INITIATED" || normStatus === "REFUND_COMPLETED") {
    returnCurrentStep = 3;
  }

  const returnStages = [
    { key: "RETURN_REQUESTED", label: "Return Requested", desc: "Request submitted within 7 days" },
    { key: "RETURN_APPROVED", label: "Return Approved", desc: "Pickup scheduled" },
    { key: "RETURNED", label: "Picked Up", desc: "Received at facility" },
    { key: "REFUNDED", label: "Refunded", desc: "Refund credited" },
  ];

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-xs">
            ✕
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Order Cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate forward progress bar fill width (10% to 90% = 80% total span)
  const forwardLineWidth = (Math.min(forwardCurrentStep, 4) / 4) * 80;
  // Calculate return progress bar fill width (12.5% to 87.5% = 75% total span)
  const returnLineWidth = (Math.min(returnCurrentStep, 3) / 3) * 75;

  return (
    <div className="space-y-6">
      {/* Forward Delivery Journey */}
      <div className="rounded-xl border border-line bg-ink-2/30 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gold" />
            Product Journey
          </h4>
          {order.trackingNumber && onTrackShipment && !isDelivered && !isReturnRelated && (
            <button
              type="button"
              onClick={onTrackShipment}
              className="text-[11px] font-semibold uppercase tracking-wider text-gold hover:text-gold-bright transition-colors"
            >
              Track Live →
            </button>
          )}
        </div>

        {/* Horizontal Progress Bar & Dots */}
        <div className="relative pt-2 pb-1">
          {/* Background Track Line (starts & ends at center of 1st and last dot) */}
          <div className="absolute top-[22px] sm:top-[24px] left-[10%] right-[10%] h-1 -translate-y-1/2 bg-line rounded-full z-0" />

          {/* Filled Progress Line (single color matching the dots) */}
          <div
            className="absolute top-[22px] sm:top-[24px] left-[10%] h-1 -translate-y-1/2 bg-gold rounded-full transition-all duration-700 ease-out z-0"
            style={{ width: `${forwardLineWidth}%` }}
          />

          {/* Stage Dots and Labels */}
          <div className="relative z-[2] flex justify-between">
            {forwardStages.map((stage, idx) => {
              const isCompleted = idx < forwardCurrentStep || (idx === 4 && isDelivered);
              const isCurrent = idx === forwardCurrentStep && !isDelivered;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center flex-1 max-w-[20%]">
                  {/* Dot */}
                  <div
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-gold text-ink shadow-[0_0_12px_rgba(200,169,126,0.5)]"
                        : isCurrent
                        ? "border-2 border-gold bg-ink text-gold ring-4 ring-gold/25 animate-pulse"
                        : "border-2 border-line bg-ink-2 text-paper-muted/50"
                    }`}
                  >
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : isCurrent ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-paper-muted/40" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="mt-2.5">
                    <p
                      className={`text-[11px] sm:text-xs font-semibold tracking-tight transition-colors ${
                        isCompleted || isCurrent ? "text-paper" : "text-paper-muted/60"
                      }`}
                    >
                      {stage.label}
                    </p>
                    {variant === "detailed" && (
                      <p className="hidden sm:block mt-0.5 text-[10px] text-paper-muted leading-tight">
                        {stage.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivered & 7-Day Window Status Note */}
        {isDelivered && !isReturnRelated && (
          <div className="mt-4 pt-3 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Delivered Successfully
            </span>
            {isWithin7Days ? (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                7-Day Return Window Active • {daysRemaining === 0 ? "Ends today" : `${daysRemaining} day${daysRemaining > 1 ? "s" : ""} left`}
              </span>
            ) : (
              <span className="text-[11px] text-paper-muted">
                7-Day Return Window Expired
              </span>
            )}
          </div>
        )}
      </div>

      {/* Return & Refund Journey (Shown if return was requested/active) */}
      {isReturnRelated && (
        <div className="rounded-xl border border-purple-300 bg-purple-50/80 p-4 sm:p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-purple-950 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-700 animate-pulse" />
              Return & Refund Journey (Applied within 7 days)
            </h4>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-purple-950 bg-purple-200/90 px-2.5 py-0.5 rounded-full border border-purple-400">
              Return Active
            </span>
          </div>

          {/* Horizontal Return Progress Bar */}
          <div className="relative pt-2 pb-1">
            {/* Background Line (starts & ends at center of 1st and last dot) */}
            <div className="absolute top-[22px] sm:top-[24px] left-[12.5%] right-[12.5%] h-1 -translate-y-1/2 bg-purple-200 rounded-full z-0" />

            {/* Filled Return Line (single color matching the purple dots) */}
            <div
              className="absolute top-[22px] sm:top-[24px] left-[12.5%] h-1 -translate-y-1/2 bg-purple-700 rounded-full transition-all duration-700 ease-out z-0"
              style={{ width: `${returnLineWidth}%` }}
            />

            {/* Dots */}
            <div className="relative z-[2] flex justify-between">
              {returnStages.map((stage, idx) => {
                const isDone = idx <= returnCurrentStep;
                const isCurr = idx === returnCurrentStep;

                return (
                  <div key={stage.key} className="flex flex-col items-center text-center flex-1 max-w-[25%]">
                    <div
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-300 ${
                        isDone
                          ? "bg-purple-700 text-white shadow-md"
                          : isCurr
                          ? "border-2 border-purple-700 bg-white text-purple-950 ring-4 ring-purple-300 font-bold animate-pulse"
                          : "border-2 border-purple-200 bg-white text-purple-300"
                      }`}
                    >
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                      )}
                    </div>

                    <div className="mt-2.5">
                      <p
                        className={`text-[11px] sm:text-xs tracking-tight ${
                          isDone ? "text-purple-950 font-bold" : "text-purple-900/60 font-semibold"
                        }`}
                      >
                        {stage.label}
                      </p>
                      {variant === "detailed" && (
                        <p className="hidden sm:block mt-0.5 text-[10px] text-purple-900/75 font-medium leading-tight">
                          {stage.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
