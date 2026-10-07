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
  file: File;
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function ReviewImages({ images, title }: { images: string[]; title?: string }) {
  if (images.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {images.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className="relative aspect-square overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container"
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
          className="rounded-full p-1 text-primary-container transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none cursor-pointer"
        >
          <StarIcon
            width={22}
            height={22}
            filled={rating <= value}
            className={rating <= value ? "text-primary-container" : "text-outline-variant"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-base sm:text-lg text-primary font-medium">
              {review.customerName}
            </span>
            <span className="inline-flex items-center text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
              Verified Buyer
            </span>
          </div>
          <span className="text-xs font-sans text-outline">
            {formatReviewDate(review.createdAt)}
          </span>
        </div>

        {/* Burgundy Stars */}
        <div className="flex items-center text-primary-container" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              width={16}
              height={16}
              filled={star <= review.rating}
              className="text-primary-container"
            />
          ))}
        </div>
      </div>

      {review.title && (
        <h4 className="font-serif text-base text-primary font-semibold mt-1">
          {review.title}
        </h4>
      )}

      <p className="font-sans text-sm sm:text-[15px] text-on-surface-variant leading-relaxed">
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
  const [showWriteForm, setShowWriteForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const createdObjectUrls = useRef(new Set<string>());

  const { data: eligibility, isLoading: checkingEligibility } = useReviewEligibility(
    productId,
    isAuthenticated
  );
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
    return localReviews.reduce((sum, review) => sum + review.rating, 0) / total;
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
      const bucket = Math.max(1, Math.min(5, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
      buckets[bucket] += 1;
    }
    return buckets;
  }, [localReviews]);

  const [moderationMessage, setModerationMessage] = useState<string>("");

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      const current = pathname || `/product/${productId}`;
      router.push(`/login?redirect=${encodeURIComponent(current)}`);
      return;
    }
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 3) {
      setSubmitError("You can upload a maximum of 3 images per review.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSizeBytes = 2 * 1024 * 1024; // 2 MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setSubmitError(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > maxSizeBytes) {
        setSubmitError(`File too large: ${file.name}. Maximum allowed size is 2 MB per image.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    setSubmitError("");
    const previews: UploadPreview[] = files.map((file) => {
      const url = URL.createObjectURL(file);
      createdObjectUrls.current.add(url);
      return {
        id: createId("review-image"),
        name: file.name,
        url,
        file,
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
    if (!trimmedComment) {
      setSubmitError("Please write a review comment sharing your experience.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setModerationMessage("");

    try {
      const hasImages = uploadedImages.length > 0;
      if (hasImages) {
        const formData = new FormData();
        formData.append("productId", productId);
        formData.append("rating", String(rating));
        formData.append("comment", trimmedComment);
        if (trimmedTitle) formData.append("title", trimmedTitle);

        uploadedImages.forEach((item) => {
          formData.append("images", item.file);
        });

        await createReviewMutation.mutateAsync(formData);
        setModerationMessage(
          "Thank you! Your review with photos has been submitted and will appear once approved by our team."
        );
      } else {
        await createReviewMutation.mutateAsync({
          productId,
          rating,
          comment: trimmedTitle ? `${trimmedTitle}\n\n${trimmedComment}` : trimmedComment,
          images: [],
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
          images: [],
          createdAt: new Date().toISOString(),
        };

        setLocalReviews((current) => [nextReview, ...current]);
        setModerationMessage("Thank you! Your review has been submitted.");
      }

      setRating(5);
      setTitle("");
      setComment("");
      setUploadedImages([]);
      setShowWriteForm(false);
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
    <section id="reviews" aria-labelledby="reviews-heading" className="w-full flex flex-col gap-10">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">
            Reviews
          </span>
          <h2
            id="reviews-heading"
            className="font-serif text-2xl sm:text-3xl text-primary font-medium mt-1"
          >
            Customer Reviews
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              router.push(`/login?redirect=${encodeURIComponent(pathname || `/product/${productId}`)}`);
              return;
            }
            setShowWriteForm((prev) => !prev);
          }}
          className="self-start md:self-auto py-2.5 px-6 rounded-full bg-surface-container text-primary font-sans text-xs uppercase tracking-wider hover:bg-surface-container-high transition-colors font-semibold cursor-pointer shadow-sm"
        >
          {showWriteForm ? "Hide Form" : "Write a Review"}
        </button>
      </div>

      {/* Main Review Grid (Left 4 cols Summary, Right 8 cols Form & Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Rating Summary Card */}
        <div className="lg:col-span-4 p-6 rounded-xl bg-surface-container-low flex flex-col gap-6 shadow-sm border border-outline-variant/20">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl sm:text-6xl text-primary font-medium leading-none">
              {currentAverageRating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center text-primary-container" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    width={18}
                    height={18}
                    filled={star <= Math.round(currentAverageRating)}
                    className="text-primary-container"
                  />
                ))}
              </div>
              <span className="text-xs font-sans text-on-surface-variant mt-1">
                Based on {total} customer review{total === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Histogram distribution */}
          <div className="flex flex-col gap-2.5 pt-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = histogram[star as 1 | 2 | 3 | 4 | 5];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs font-sans">
                  <span className="w-12 text-on-surface-variant">{star} Star</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-primary">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Review Write Form & Review Cards List */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Write Review Section / Eligibility Container */}
          {showWriteForm && (
            <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col gap-4 animate-fadeIn">
              <h3 className="font-serif text-lg text-primary font-medium border-b border-outline-variant/20 pb-3">
                Write a Review
              </h3>

              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <p className="text-xs text-on-surface-variant mb-4">
                    Please sign in with your verified KamiraFit account to submit a review.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/login?redirect=${encodeURIComponent(pathname || `/product/${productId}`)}`
                      )
                    }
                    className="py-2.5 px-6 rounded-full bg-primary-container text-white text-xs uppercase tracking-wider font-semibold hover:bg-primary transition-colors cursor-pointer"
                  >
                    Sign in to Review
                  </button>
                </div>
              ) : checkingEligibility ? (
                <div className="flex items-center justify-center py-8 text-xs text-on-surface-variant gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Checking purchase eligibility...
                </div>
              ) : !eligibility?.eligible ? (
                <div className="text-center py-6 px-4 bg-surface-container-low rounded-xl">
                  {eligibility?.reason === "ALREADY_REVIEWED" ? (
                    <p className="text-xs text-primary font-medium">
                      You have already submitted a review for this product. Thank you for your feedback!
                    </p>
                  ) : eligibility?.reason === "NOT_DELIVERED" ? (
                    <p className="text-xs text-primary font-medium">
                      Your order has not been marked as delivered yet. You can review as soon as your package arrives.
                    </p>
                  ) : (
                    <p className="text-xs text-on-surface-variant">
                      To preserve authentic feedback, only customers who have purchased and received this product can submit a review.
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                  {submitError && (
                    <p className="text-xs text-error font-medium bg-error-container/40 p-3 rounded-lg">
                      {submitError}
                    </p>
                  )}

                  {moderationMessage && (
                    <p className="text-xs text-[#0f6b4d] font-medium bg-[#d0f2e3] p-3 rounded-lg">
                      {moderationMessage}
                    </p>
                  )}

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Overall Rating
                    </label>
                    <div className="mt-2">
                      <RatingInput value={rating} onChange={setRating} />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="review-title"
                      className="text-xs font-semibold uppercase tracking-wider text-primary"
                    >
                      Headline
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Exceptional drape and artisanal texture"
                      className="mt-1.5 w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-primary focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="review-comment"
                      className="text-xs font-semibold uppercase tracking-wider text-primary"
                    >
                      Your Review <span className="text-primary-container">*</span>
                    </label>
                    <textarea
                      id="review-comment"
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        if (submitError) setSubmitError("");
                      }}
                      rows={4}
                      placeholder="How did it fit, drape, and wear?"
                      className="mt-1.5 w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-primary focus:outline-none focus:border-primary resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="review-images"
                      className="text-xs font-semibold uppercase tracking-wider text-primary"
                    >
                      Add Photos (Up to 3)
                    </label>
                    <input
                      ref={fileInputRef}
                      id="review-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="mt-1.5 block w-full text-xs text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-surface-container file:text-primary hover:file:bg-surface-container-high cursor-pointer"
                    />

                    {uploadedImages.length > 0 && (
                      <div className="mt-3 flex gap-3 flex-wrap">
                        {uploadedImages.map((img) => (
                          <div
                            key={img.id}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant/40"
                          >
                            <Image
                              src={img.url}
                              alt={img.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary/70 text-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"
                            >
                              <CloseIcon width={12} height={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-3 px-6 rounded-full bg-primary-container hover:bg-primary text-white text-xs uppercase tracking-wider font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm mt-2"
                  >
                    {submitting ? "Submitting..." : "Publish Review"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* List of Customer Reviews */}
          {localReviews.length === 0 ? (
            <div className="p-8 rounded-xl bg-surface-container-lowest text-center border border-outline-variant/20">
              <p className="font-serif text-base text-primary">No customer reviews yet.</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Be the first verified customer to share fit and fabric notes on this piece.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {localReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
