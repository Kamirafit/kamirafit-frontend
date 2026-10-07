"use client";

export default function WishlistGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading curated wishlist"
      aria-busy="true"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/30"
        >
          {/* 4:5 Product Image Skeleton */}
          <div className="relative w-full aspect-[4/5] bg-surface-container animate-pulse" />

          {/* Card Metadata Tray Skeleton */}
          <div className="p-5 flex flex-col flex-1 justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-1/3 rounded-full bg-surface-container-high animate-pulse" />
              <div className="h-5 w-3/4 rounded-full bg-surface-container-high animate-pulse" />
              <div className="h-3 w-5/6 rounded-full bg-surface-container-high animate-pulse" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="h-5 w-1/3 rounded-full bg-surface-container-high animate-pulse" />
              <div className="h-11 w-full rounded-full bg-surface-container-high animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
