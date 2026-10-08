"use client";

import { useState } from "react";
import type { AdminReview } from "@/types/entities";
import Modal from "./Modal";
import ActionButton from "./ActionButton";

interface Props {
  review: AdminReview | null;
  open: boolean;
  onClose: () => void;
  onModerate: (id: string, status: "APPROVED" | "REJECTED") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function StarIconFilled({ className = "h-4 w-4 text-gold" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarIconEmpty({ className = "h-4 w-4 text-ink-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function ReviewDetailsModal({
  review,
  open,
  onClose,
  onModerate,
  onDelete,
}: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!review) return null;

  const handleStatusChange = async (status: "APPROVED" | "REJECTED") => {
    try {
      setIsActionLoading(true);
      await onModerate(review.id, status);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsActionLoading(true);
      await onDelete(review.id);
      onClose();
    } finally {
      setIsActionLoading(false);
      setConfirmDelete(false);
    }
  };

  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <Modal
        open={open}
        title="Review Verification & Inspection"
        onClose={onClose}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-6">
          {/* Status Header Notification Banner */}
          {review.status === "PENDING" && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900">
              <span className="relative mt-0.5 flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
              </span>
              <div className="flex flex-col text-xs leading-relaxed">
                <span className="font-semibold text-amber-950">
                  Pending Verification
                </span>
                <span>
                  This review has been submitted by the customer and is hidden from the storefront. Click <strong>Approve &amp; Publish</strong> to make it publicly visible to all shoppers.
                </span>
              </div>
            </div>
          )}

          {review.status === "APPROVED" && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900">
              <span className="mt-0.5 flex h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
              <div className="flex flex-col text-xs leading-relaxed">
                <span className="font-semibold text-emerald-950">
                  Approved &amp; Live on Storefront
                </span>
                <span>
                  This customer review is verified and currently appearing on the product details page.
                </span>
              </div>
            </div>
          )}

          {review.status === "REJECTED" && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-900">
              <span className="mt-0.5 flex h-3 w-3 shrink-0 rounded-full bg-rose-500" />
              <div className="flex flex-col text-xs leading-relaxed">
                <span className="font-semibold text-rose-950">
                  Rejected / Hidden
                </span>
                <span>
                  This review has been rejected and is completely hidden from the storefront. You can re-approve it at any time.
                </span>
              </div>
            </div>
          )}

          {/* Product & Customer Details Split Card */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Product Card */}
            <div className="flex flex-col justify-between rounded-xl border border-line bg-ink-2/40 p-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted">
                  Product Reviewed
                </span>
                <h4 className="mt-1 text-sm font-semibold text-paper">
                  {review.product.name}
                </h4>
                {review.product.slug && (
                  <span className="text-xs text-gold/90 font-mono">
                    /{review.product.slug}
                  </span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-line/60 text-[11.5px] text-paper-muted">
                Product ID: <span className="font-mono text-paper">{review.product.id || "—"}</span>
              </div>
            </div>

            {/* Customer Card */}
            <div className="flex flex-col justify-between rounded-xl border border-line bg-ink-2/40 p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted">
                    Customer
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Verified Buyer
                  </span>
                </div>
                <h4 className="mt-1 text-sm font-semibold text-paper">
                  {review.customer.name}
                </h4>
                <div className="mt-1 flex flex-col text-xs text-paper-muted">
                  {review.customer.email && <span>{review.customer.email}</span>}
                  {review.customer.phone && <span>{review.customer.phone}</span>}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-line/60 text-[11.5px] text-paper-muted">
                Submitted on: <span className="text-paper">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Rating & Full Review Body */}
          <div className="rounded-xl border border-line bg-ink-2/30 p-5">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) =>
                    i < review.rating ? (
                      <StarIconFilled key={i} className="h-4 w-4" />
                    ) : (
                      <StarIconEmpty key={i} className="h-4 w-4" />
                    )
                  )}
                </div>
                <span className="font-display text-base font-bold text-paper">
                  {review.rating}.0
                </span>
                <span className="text-xs text-paper-muted">out of 5</span>
              </div>

              <span className="text-xs text-paper-muted font-mono">
                ID: {review.id}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted">
                Review Content
              </span>
              <p className="mt-2 text-sm leading-relaxed text-paper whitespace-pre-wrap">
                {review.comment || <em className="text-paper-muted">No written feedback provided (rating only).</em>}
              </p>
            </div>
          </div>

          {/* Customer Uploaded Photos Gallery */}
          {review.images && review.images.length > 0 && (
            <div className="rounded-xl border border-line bg-ink-2/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted">
                  Customer Uploaded Photos ({review.images.length})
                </span>
                <span className="text-[11px] text-paper-muted">
                  Click any photo to inspect full size
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {review.images.map((imgUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-ink transition-all hover:border-gold hover:shadow-md focus:outline-none"
                  >
                    <img
                      src={imgUrl}
                      alt={`Customer review image ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-ink-2/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-gold">
                      Zoom ↗
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verification & Moderation Actions */}
          <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 font-semibold">Delete review permanently?</span>
                <ActionButton
                  tone="danger"
                  loading={isActionLoading}
                  onClick={handleDelete}
                >
                  Confirm Delete
                </ActionButton>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-paper-muted hover:text-paper"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-paper-muted hover:text-rose-600 transition-colors text-left sm:text-center"
              >
                Delete Review Permanently
              </button>
            )}

            <div className="flex items-center gap-2.5">
              {review.status !== "APPROVED" && (
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleStatusChange("APPROVED")}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  <span>✓</span>
                  <span>Approve &amp; Publish Live</span>
                </button>
              )}

              {review.status !== "REJECTED" && (
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => handleStatusChange("REJECTED")}
                  className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                >
                  <span>✕</span>
                  <span>Reject &amp; Hide</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line bg-ink px-3.5 py-2 text-xs font-semibold text-paper hover:bg-ink-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Lightbox Modal for Full-Size Image Preview */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-xl border border-line/40 bg-ink">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Close image preview"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Enlarged review photo"
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
