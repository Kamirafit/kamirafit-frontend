"use client";

import { useState } from "react";
import { useOrderTracking } from "@/services/order";

type Props = {
  orderId: string;
  orderNumber?: string;
  onClose: () => void;
};

export default function OrderTrackingModal({ orderId, orderNumber, onClose }: Props) {
  const { data: tracking, isLoading, isError, refetch } = useOrderTracking(orderId);
  const [copied, setCopied] = useState(false);

  const handleCopyAwb = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-scrollbar-hidden rounded-2xl border border-line bg-ink shadow-2xl backdrop-blur-xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 border-b border-line bg-ink/95 px-6 py-5 backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-lg font-bold text-paper">
                Shipment Tracking
              </h2>
              {tracking?.courierName && (
                <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
                  {tracking.courierName}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-paper-muted">
              Order #{orderNumber || tracking?.orderNumber || orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-paper-muted hover:bg-ink-2 hover:text-paper transition-colors"
            aria-label="Close modal"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-8">
          {isLoading ? (
            <div className="space-y-6 py-8">
              <div className="h-6 w-1/3 bg-ink-2 animate-pulse rounded" />
              <div className="h-24 w-full bg-ink-2 animate-pulse rounded-xl" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-ink-2 animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-ink-2 animate-pulse rounded" />
                <div className="h-4 w-4/6 bg-ink-2 animate-pulse rounded" />
              </div>
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-400">Unable to load live tracking details at this moment.</p>
              <button
                onClick={() => void refetch()}
                className="mt-4 rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wider text-paper hover:border-gold hover:text-gold transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Carrier & AWB Summary Banner */}
              <div className="rounded-2xl border border-line bg-ink-2/60 p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">
                    Waybill (AWB) Tracking Number
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-paper">
                      {tracking?.trackingCode || "Awaiting Carrier AWB"}
                    </span>
                    {tracking?.trackingCode && (
                      <button
                        onClick={() => handleCopyAwb(tracking.trackingCode!)}
                        className="text-xs text-gold hover:underline font-medium"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    )}
                  </div>
                </div>

                {tracking?.etd && (
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">
                      Estimated Delivery
                    </p>
                    <p className="mt-1 font-display text-sm font-semibold text-gold">
                      {tracking.etd}
                    </p>
                  </div>
                )}
              </div>

              {/* Milestones Progress Tracker */}
              <div className="space-y-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted">
                  Delivery Milestones
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                  {(tracking?.milestones || []).map((step, idx) => {
                    const isDone = step.completed;
                    const isCurrent = step.current;

                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        {/* Node Dot */}
                        <div
                          className={`absolute -left-6 mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isDone
                              ? "border-gold bg-gold text-ink"
                              : isCurrent
                              ? "border-gold bg-ink ring-4 ring-gold/20"
                              : "border-line bg-ink text-transparent"
                          }`}
                        >
                          {isDone ? (
                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                          )}
                        </div>

                        {/* Step Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-semibold ${
                                isDone || isCurrent ? "text-paper" : "text-paper-muted"
                              }`}
                            >
                              {step.name}
                            </p>
                            {step.date && (
                              <span className="text-[11px] text-paper-muted font-mono">
                                {new Date(step.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-paper-muted leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Live Carrier Scan History */}
              {tracking?.scans && tracking.scans.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-line">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted">
                      Carrier Scan History
                    </h3>
                    <span className="text-xs text-paper-muted">
                      {tracking.scans.length} events logged
                    </span>
                  </div>

                  <div className="rounded-2xl border border-line bg-ink-2/30 divide-y divide-line overflow-hidden">
                    {tracking.scans.map((scan, idx) => (
                      <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <p className="font-medium text-paper">
                            {scan.activity || scan.status || "In Transit"}
                          </p>
                          {scan.location && (
                            <p className="text-paper-muted mt-0.5">
                              📍 {scan.location}
                            </p>
                          )}
                        </div>
                        {scan.date && (
                          <span className="font-mono text-paper-muted shrink-0 sm:text-right">
                            {scan.date}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Carrier External Tracking Link */}
              {tracking?.trackingUrl && (
                <div className="pt-2">
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-ink transition-colors"
                  >
                    Open Live Carrier Tracking Portal
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
