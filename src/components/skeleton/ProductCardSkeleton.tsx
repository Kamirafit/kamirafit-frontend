export default function ProductCardSkeleton() {
  return (
    <div className="group rounded-2xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-sm flex flex-col justify-between">
      {/* Product Image Skeleton with Shimmer */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container animate-shimmer" />

      {/* Product Text Skeleton with Shimmer */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Metadata / Category Line */}
          <div className="h-2.5 w-1/3 rounded-full bg-surface-container-high animate-shimmer" />

          {/* Title Line */}
          <div className="h-4 w-3/4 rounded-full bg-surface-container-high animate-shimmer" />

          {/* Description Line */}
          <div className="h-3 w-5/6 rounded-full bg-surface-container-high animate-shimmer" />
        </div>

        {/* Price and Action Line */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <div className="h-5 w-1/3 rounded-full bg-surface-container-high animate-shimmer" />
          <div className="h-10 w-10 rounded-full bg-surface-container-high animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

