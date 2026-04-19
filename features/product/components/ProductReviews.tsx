"use client";

import { useMemo } from "react";
import type { Review } from "../types";
import { StarIcon } from "./icons";
import StarRating from "./StarRating";

type Props = {
  reviews: Review[];
  averageRating: number;
};

export default function ProductReviews({ reviews, averageRating }: Props) {
  const histogram = useMemo(() => {
    const buckets: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    for (const r of reviews) {
      const bucket = Math.max(
        1,
        Math.min(5, Math.round(r.rating)),
      ) as 1 | 2 | 3 | 4 | 5;
      buckets[bucket] += 1;
    }
    return buckets;
  }, [reviews]);

  const total = reviews.length;
  const latest = reviews[0];

  return (
    <section
      aria-labelledby="reviews-heading"
      className="flex flex-col gap-6"
    >
      <div className="flex items-end justify-between gap-3">
        <h2
          id="reviews-heading"
          className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl"
        >
          Rating & Reviews
        </h2>
        <button
          type="button"
          className="hidden text-[12px] font-medium uppercase tracking-[0.18em] text-paper-muted underline-offset-4 transition-colors hover:text-gold hover:underline sm:inline-flex"
        >
          View all {total}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 rounded-2xl border border-line bg-ink p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:p-8">
        <div className="flex flex-col gap-5 lg:border-r lg:border-line lg:pr-8">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-semibold text-paper sm:text-6xl">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-lg text-paper-muted">/5</span>
          </div>
          <StarRating rating={averageRating} size={18} />
          <p className="text-[13px] text-paper-muted">
            Based on {total} verified review{total === 1 ? "" : "s"}
          </p>

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
                  <StarIcon
                    width={12}
                    height={12}
                    filled
                    className="text-gold"
                  />
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

        <div className="flex flex-col gap-4">
          {latest ? (
            <article className="rounded-xl border border-line bg-ink-2 p-5">
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 font-display text-sm font-semibold text-gold"
                    aria-hidden
                  >
                    {latest.author
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-paper">
                      {latest.author}
                    </p>
                    <p className="text-[11.5px] text-paper-muted">
                      {new Date(latest.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={latest.rating} size={13} />
              </header>
              <p className="mt-4 text-[13.5px] leading-relaxed text-paper">
                {latest.comment}
              </p>
            </article>
          ) : null}

          <ul className="flex flex-col gap-3">
            {reviews.slice(1, 3).map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-line bg-ink p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[13.5px] font-medium text-paper">
                    {r.author}
                  </p>
                  <StarRating rating={r.rating} size={12} />
                </div>
                <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-paper-muted">
                  {r.comment}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
