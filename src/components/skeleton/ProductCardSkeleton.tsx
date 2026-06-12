export default function ProductCardSkeleton() {
  return (
    <div className="group animate-pulse">
      {/* Product Image Skeleton */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-ink-3" />
      
      {/* Product Text Skeleton */}
      <div className="mt-4 space-y-2.5">
        {/* Category Line */}
        <div className="h-3 w-1/3 rounded bg-ink-3" />
        
        {/* Title Line */}
        <div className="h-4 w-3/4 rounded bg-ink-3" />
        
        {/* Price and Rating Line */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-1/4 rounded bg-ink-4" />
          <div className="h-4 w-1/5 rounded bg-ink-3" />
        </div>
      </div>
    </div>
  );
}
