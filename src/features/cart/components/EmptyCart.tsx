"use client";

import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-6 py-16 sm:py-20 text-center shadow-xs">
      <div
        aria-hidden="true"
        className="flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container text-primary shadow-xs"
      >
        <svg
          className="h-8 w-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2 max-w-sm">
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-primary">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Looks like you haven&apos;t added any atelier pieces yet. Explore our latest
          collection to find your next wardrobe signature.
        </p>
      </div>

      <Link
        href="/shop"
        className="group inline-flex items-center gap-2 rounded-full bg-primary-container px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-primary hover:shadow-lg"
      >
        <span>Continue Shopping</span>
        <svg
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}
