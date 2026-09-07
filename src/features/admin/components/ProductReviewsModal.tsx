"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { Product } from "@/features/product/types";
import { useProductReviews } from "@/services/admin";
import Modal from "./Modal";

type Props = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
};

export default function ProductReviewsModal({ product, open, onClose }: Props) {
  const productId = product?.id || "";
  const { data: reviews = [], isLoading, isError } = useProductReviews(productId);

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        total: 0,
        average: 0,
        distribution: [
          { stars: 5, count: 0, percent: 0 },
          { stars: 4, count: 0, percent: 0 },
          { stars: 3, count: 0, percent: 0 },
          { stars: 2, count: 0, percent: 0 },
          { stars: 1, count: 0, percent: 0 },
        ],
      };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const average = Number((sum / total).toFixed(1));

    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => Math.round(Number(r.rating)) === stars).length;
      const percent = Math.round((count / total) * 100);
      return { stars, count, percent };
    });

    return { total, average, distribution };
  }, [reviews]);

  if (!product) return null;

  return (
    <Modal
      open={open}
      title={`Reviews — ${product.name}`}
      onClose={onClose}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        {/* Product Snapshot Bar */}
        <div className="flex items-center gap-4 rounded-xl border border-line bg-ink-2/60 p-3 sm:p-4">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
            <Image
              src={product.image || "/images/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                {product.category}
              </span>
              <span className="text-[11px] text-paper-muted">·</span>
              <span className="text-[11px] text-paper-muted">ID: {product.id}</span>
            </div>
            <h3 className="truncate text-base font-medium text-paper">{product.name}</h3>
            <p className="text-xs text-paper-muted">
              ₹{Number(product.price).toLocaleString("en-IN")} · {product.variants?.length || 0} variants
            </p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-ink-2/30 p-4 sm:grid-cols-12 sm:items-center">
          <div className="flex flex-col items-center justify-center border-b border-line pb-4 text-center sm:col-span-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-paper">
                {stats.total > 0 ? stats.average.toFixed(1) : "0.0"}
              </span>
              <span className="text-xl text-amber-400">★</span>
            </div>
            <div className="mt-1 flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-xs">
                  {s <= Math.round(stats.average) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <p className="mt-1 text-xs text-paper-muted">
              Based on {stats.total} verified {stats.total === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-8 sm:pl-2">
            {stats.distribution.map(({ stars, count, percent }) => (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-right font-medium text-paper-muted">{stars} ★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line/40">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-12 text-left text-[11px] text-paper-muted">
                  {count} ({percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-paper">
              Customer Feedback ({reviews.length})
            </h4>
            <span className="text-[11.5px] text-paper-muted">Verified delivered purchases only</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3 py-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse rounded-xl border border-line bg-ink-2/40 p-4">
                  <div className="h-4 w-32 rounded bg-line" />
                  <div className="mt-2 h-3 w-48 rounded bg-line/60" />
                  <div className="mt-3 h-12 w-full rounded bg-line/40" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-400">
              Failed to load product reviews. Please try again.
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-12 text-center">
              <span className="text-2xl text-paper-muted">💬</span>
              <p className="mt-2 font-medium text-paper">No reviews submitted yet</p>
              <p className="mt-1 max-w-sm text-xs text-paper-muted">
                Reviews will appear here automatically once customers who purchased and received this product leave feedback.
              </p>
            </div>
          ) : (
            <div className="flex max-h-[48vh] flex-col gap-3 overflow-y-auto pr-1">
              {reviews.map((rev) => {
                const authorName = [rev.user?.firstName, rev.user?.lastName].filter(Boolean).join(" ") || "Customer";
                const dateStr = rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "";

                return (
                  <div
                    key={rev.id}
                    className="flex flex-col gap-2 rounded-xl border border-line bg-ink-2/40 p-4 transition-colors hover:border-line-light"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-paper">{authorName}</span>
                          {rev.user?.email && (
                            <span className="ml-2 text-xs text-paper-muted">({rev.user.email})</span>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          ✓ Verified Buyer
                        </span>
                      </div>
                      <span className="text-xs text-paper-muted">{dateStr}</span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-xs">
                          {s <= rev.rating ? "★" : "☆"}
                        </span>
                      ))}
                      <span className="ml-1.5 text-xs font-semibold text-paper">
                        {rev.rating}.0
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="whitespace-pre-line text-xs leading-relaxed text-paper/90">
                      {rev.comment}
                    </p>

                    {/* Attached images if any */}
                    {Array.isArray(rev.images) && rev.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rev.images.map((img, i) => (
                          <div
                            key={i}
                            className="relative h-14 w-14 overflow-hidden rounded-lg border border-line bg-ink-2"
                          >
                            <Image
                              src={img}
                              alt="Review attachment"
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
