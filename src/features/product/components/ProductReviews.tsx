"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAppSelector } from "../hooks/redux";
import type { Review } from "../types";
import { CloseIcon, StarIcon } from "./icons";
import StarRating from "./StarRating";
import { useReviewEligibility, useCreateReview } from "@/services/review";

type Props = {
  productId: string;
  reviews: Review[];
  averageRating: number;
};

type UploadPreview = {
  id: string;
  name: string;
  url: string;
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ReviewImages({ images, title }: { images: string[]; title?: string }) {
  if (images.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {images.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className="relative aspect-square overflow-hidden rounded-lg border border-line bg-ink"
        >
          <Image
            src={image}
            alt={title ? `${title} review image ${index + 1}` : `Review image ${index + 1}`}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}

function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Review rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
          onClick={() => onChange(rating)}
          className="rounded-full p-1 text-gold transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          <StarIcon
            width={22}
            height={22}
            filled={rating <= value}
            className={rating <= value ? "text-gold" : "text-line-strong"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-2xl border border-line bg-ink-2 p-5 shadow-[0_24px_60px_-42px_rgba(74,14,26,0.4)] sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 font-display text-sm font-semibold text-gold"
            aria-hidden
          >
            {getInitials(review.customerName)}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-paper">
              {review.customerName}
            </p>
            <p className="text-[11.5px] text-paper-muted">
              {formatReviewDate(review.createdAt)}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size={13} />
      </header>

      {review.title ? (
        <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-paper">
          {review.title}
        </h3>
      ) : null}
      <p className="mt-2 text-[13.5px] leading-relaxed text-paper-muted">
        {review.comment}
      </p>
      <ReviewImages images={review.images} title={review.title} />
    </article>
  );
}

export default function ProductReviews({
  productId,
  reviews,
  averageRating,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createdObjectUrls = useRef(new Set<string>());

  const { data: eligibility, isLoading: checkingEligibility } = useReviewEligibility(productId, isAuthenticated);
  const createReviewMutation = useCreateReview();

  useEffect(() => {
    const objectUrls = createdObjectUrls.current;
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  const total = localReviews.length;
  const currentAverageRating = useMemo(() => {
    if (total === 0) return averageRating;
    return (
      localReviews.reduce((sum, review) => sum + review.rating, 0) / total
    );
  }, [averageRating, localReviews, total]);

  const histogram = useMemo(() => {
    const buckets: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const review of localReviews) {
      const bucket = Math.max(
        1,
        Math.min(5, Math.round(review.rating)),
      ) as 1 | 2 | 3 | 4 | 5;
      buckets[bucket] += 1;
    }
    return buckets;
  }, [localReviews]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      const current = pathname || `/product/${productId}`;
      router.push(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const previews = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => {
        const url = URL.createObjectURL(file);
        createdObjectUrls.current.add(url);
        return {
          id: createId("review-image"),
          name: file.name,
          url,
        };
      });

    setUploadedImages((current) => [...current, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (imageId: string) => {
    setUploadedImages((current) => {
      const image = current.find((item) => item.id === imageId);
      if (image) {
        URL.revokeObjectURL(image.url);
        createdObjectUrls.current.delete(image.url);
      }
      return current.filter((item) => item.id !== imageId);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      const current = pathname || `/product/${productId}`;
      router.push(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }
    const trimmedComment = comment.trim();
    const trimmedTitle = title.trim();
    if (!trimmedComment) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      await createReviewMutation.mutateAsync({
        productId,
        rating,
        comment: trimmedTitle ? `${trimmedTitle}\n\n${trimmedComment}` : trimmedComment,
        images: uploadedImages.map((image) => image.url),
      });

      const customerName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Verified Customer";

      const nextReview: Review = {
        id: createId("review"),
        productId,
        customerName,
        rating,
        title: trimmedTitle || undefined,
        comment: trimmedComment,
        images: uploadedImages.map((image) => image.url),
        createdAt: new Date().toISOString(),
      };

      setLocalReviews((current) => [nextReview, ...current]);
      setRating(5);
      setTitle("");
      setComment("");
      setUploadedImages([]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to submit your review. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="reviews-heading"
            className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl"
          >
            Rating & Reviews
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-paper-muted">
            <StarRating rating={currentAverageRating} size={16} />
            <span className="font-semibold text-paper">
              {currentAverageRating.toFixed(1)}
            </span>
            <span>
              ({total} Review{total === 1 ? "" : "s"})
            </span>
          </div>
        </div>
        <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-paper-muted">
          Share your fit notes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-2xl border border-line bg-ink p-5 shadow-[0_30px_70px_-52px_rgba(74,14,26,0.35)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-8 lg:p-8">
        <div className="flex flex-col gap-6 lg:border-r lg:border-line lg:pr-8">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-semibold text-paper sm:text-6xl">
                {currentAverageRating.toFixed(1)}
              </span>
              <span className="text-lg text-paper-muted">/5</span>
            </div>
            <p className="mt-2 text-[13px] text-paper-muted">
              Based on {total} verified review{total === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = histogram[star as 1 | 2 | 3 | 4 | 5];
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div
                  key={star}
                  className="flex items-center gap-3 text-[12px] text-paper-muted"
                >
                  <span className="flex w-5 items-center gap-0.5 tabular-nums">
                    {star}
                  </span>
                  <StarIcon width={12} height={12} filled className="text-gold" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full bg-gold transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-ink-2/40 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-display text-base font-semibold text-paper">Verified Customer Reviews</h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-paper-muted">
              Only customers who have purchased and received this product can write a review.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(pathname || `/product/${productId}`)}`)}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-all hover:bg-gold-bright cursor-pointer"
            >
              Sign in to review
            </button>
          </div>
        ) : checkingEligibility ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-line bg-ink-2/30">
            <div className="flex items-center gap-2 text-xs text-paper-muted">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              Checking review eligibility...
            </div>
          </div>
        ) : !eligibility?.eligible ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-ink-2/40 p-8 text-center">
            {eligibility?.reason === "ALREADY_REVIEWED" ? (
              <>
                <span className="text-3xl">✨</span>
                <h3 className="mt-3 font-display text-base font-semibold text-gold">Review Submitted</h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-paper-muted">
                  You have already reviewed this product. Thank you for sharing your experience!
                </p>
              </>
            ) : eligibility?.reason === "NOT_DELIVERED" ? (
              <>
                <span className="text-3xl">📦</span>
                <h3 className="mt-3 font-display text-base font-semibold text-amber-400">Order in Progress</h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-paper-muted">
                  Your order has not been marked as delivered yet. You can write your review as soon as your package arrives.
                </p>
              </>
            ) : (
              <>
                <span className="text-3xl">🛍️</span>
                <h3 className="mt-3 font-display text-base font-semibold text-paper">Verified Purchase Required</h3>
                <p className="mt-2 max-w-sm text-xs leading-relaxed text-paper-muted">
                  To ensure authentic feedback, only customers who have purchased and received this product can write a review.
                </p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {submitError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                {submitError}
              </div>
            )}
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-paper-muted">
                Rating
              </label>
              <div className="mt-2">
                <RatingInput value={rating} onChange={setRating} />
              </div>
            </div>

            <div>
              <label
                htmlFor="review-title"
                className="text-[12px] font-semibold uppercase tracking-[0.18em] text-paper-muted"
              >
                Review title
              </label>
              <input
                id="review-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Optional headline"
                className="mt-2 w-full rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-paper-muted/70 focus:border-gold"
              />
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="text-[12px] font-semibold uppercase tracking-[0.18em] text-paper-muted"
              >
                Review comment
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                required
                rows={4}
                placeholder="How did it fit, feel, and wear?"
                className="mt-2 w-full resize-none rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm leading-relaxed text-paper outline-none transition-colors placeholder:text-paper-muted/70 focus:border-gold"
              />
            </div>

            <div>
              <label
                htmlFor="review-images"
                className="text-[12px] font-semibold uppercase tracking-[0.18em] text-paper-muted"
              >
                Review images
              </label>
              <input
                ref={fileInputRef}
                id="review-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="mt-2 block w-full cursor-pointer rounded-xl border border-dashed border-line bg-ink-2 px-4 py-3 text-sm text-paper-muted file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.16em] file:text-white hover:border-gold/60"
              />

              {uploadedImages.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-ink"
                    >
                      <Image
                        src={image.url}
                        alt={image.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        aria-label={`Remove ${image.name}`}
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-ink/80 text-paper shadow-lg backdrop-blur-md transition-colors hover:bg-gold hover:text-white"
                      >
                        <CloseIcon width={14} height={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-full border-2 border-gold bg-gold px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_-14px_rgba(74,14,26,0.6)] transition-all duration-300 hover:bg-transparent hover:text-gold disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {localReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
