export default function ProductDetailsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading product details"
      aria-busy="true"
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start"
    >
      {/* 7-col Gallery Skeleton (Vertical thumbs + Hero) */}
      <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 xl:gap-6 w-full">
        <div className="flex md:flex-col gap-3 shrink-0 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-16 h-22 sm:w-20 sm:h-28 rounded-xl bg-surface-container animate-shimmer"
            />
          ))}
        </div>
        <div className="flex-1 aspect-[4/5] min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] max-h-[calc(100vh-140px)] rounded-2xl bg-surface-container-low animate-shimmer" />
      </div>

      {/* 5-col Product Info Skeleton */}
      <div className="lg:col-span-5 flex flex-col gap-6 lg:pl-2">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded bg-surface-container animate-shimmer" />
          <div className="h-10 w-4/5 rounded-lg bg-surface-container-high animate-shimmer" />
          <div className="h-4 w-36 rounded bg-surface-container animate-shimmer" />
        </div>

        {/* Price Card Skeleton */}
        <div className="p-4 rounded-xl bg-surface-container-low space-y-2">
          <div className="h-8 w-44 rounded bg-surface-container-high animate-shimmer" />
          <div className="h-3.5 w-52 rounded bg-surface-container animate-shimmer" />
        </div>

        {/* Palette Swatches */}
        <div className="space-y-3">
          <div className="h-3 w-20 rounded bg-surface-container animate-shimmer" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-surface-container animate-shimmer"
              />
            ))}
          </div>
        </div>

        {/* Sizing Grid */}
        <div className="space-y-3">
          <div className="h-3 w-20 rounded bg-surface-container animate-shimmer" />
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-11 rounded-lg bg-surface-container animate-shimmer"
              />
            ))}
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-14 rounded-full bg-surface-container-high animate-shimmer" />
          <div className="w-[52px] h-[52px] rounded-full bg-surface-container animate-shimmer" />
        </div>

        {/* Delivery Box Skeleton */}
        <div className="h-32 rounded-2xl bg-surface-container-low border border-outline-variant/30 animate-shimmer" />
      </div>
    </div>
  );
}
