export default function ProductCardSkeleton() {
  return (
    <div className="group">
      {/* Product Image Skeleton with Shimmer */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-ink-3/80 animate-shimmer" />
      
      {/* Product Text Skeleton with Shimmer */}
      <div className="mt-4 space-y-2.5">
        {/* Category Line */}
        <div className="h-3 w-1/3 rounded bg-ink-3 animate-shimmer" />
        
        {/* Title Line */}
        <div className="h-4 w-3/4 rounded bg-ink-3 animate-shimmer" />
        
        {/* Price and Rating Line */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-1/4 rounded bg-ink-4 animate-shimmer" />
          <div className="h-4 w-1/5 rounded bg-ink-3 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
