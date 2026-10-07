"use client";

import Link from "next/link";

type OrderSuccessErrorProps = {
  onRetry?: () => void;
  message?: string;
};

export default function OrderSuccessError({
  onRetry,
  message = "We couldn't retrieve the details of this order right now.",
}: OrderSuccessErrorProps) {
  return (
    <div className="relative w-full py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto text-center">
      <div className="bg-surface-container-lowest rounded-2xl p-8 sm:p-12 border border-outline-variant/30 shadow-sm flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-secondary-container/50 text-primary flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-surface-tint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <span className="font-sans text-xs uppercase text-surface-tint tracking-[0.2em] font-semibold mb-2">
          Unable to Load
        </span>
        <h2 className="font-display text-2xl sm:text-3xl text-primary font-medium mb-3">
          We Couldn&apos;t Load Your Order
        </h2>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-md mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-container transition-all cursor-pointer shadow-sm"
            >
              Try Again
            </button>
          )}
          <Link
            href="/account/orders"
            className="px-6 py-2.5 rounded-full border border-primary text-primary hover:bg-primary/5 transition-all text-xs font-semibold uppercase tracking-wider"
          >
            Go to My Orders
          </Link>
          <Link
            href="/shop"
            className="px-6 py-2.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-all text-xs font-semibold uppercase tracking-wider"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
