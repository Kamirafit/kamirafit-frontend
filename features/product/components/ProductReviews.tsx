import type { Review } from "../types";
import StarRating from "./StarRating";

type Props = {
  reviews: Review[];
  averageRating: number;
};

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export default function ProductReviews({ reviews, averageRating }: Props) {
  return (
    <section aria-labelledby="reviews-heading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2
          id="reviews-heading"
          className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl"
        >
          Customer Reviews
        </h2>
        <div className="flex items-center gap-3">
          <StarRating rating={averageRating} size={16} />
          <p className="text-sm text-neutral-600">
            {averageRating.toFixed(1)} · {reviews.length} review
            {reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-neutral-200 border-t border-neutral-200">
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 py-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-900">
                {r.author}
              </p>
              <p className="text-xs text-neutral-500">{formatDate(r.date)}</p>
            </div>
            <StarRating rating={r.rating} size={13} />
            <p className="text-sm leading-relaxed text-neutral-700">
              {r.comment}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
