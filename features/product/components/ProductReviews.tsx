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
      <header className="flex flex-col gap-2">
        <h2
          id="reviews-heading"
          className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl"
        >
          Customer Reviews
        </h2>
        <div className="flex items-center gap-3">
          <StarRating rating={averageRating} size={16} />
          <p className="text-sm text-paper-muted">
            {averageRating.toFixed(1)} · {reviews.length} review
            {reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      <ul className="flex flex-col divide-y divide-line border-y border-line">
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 py-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display text-sm font-semibold text-paper">
                {r.author}
              </p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-paper-muted">
                {formatDate(r.date)}
              </p>
            </div>
            <StarRating rating={r.rating} size={13} />
            <p className="text-sm leading-relaxed text-paper-muted">
              {r.comment}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
