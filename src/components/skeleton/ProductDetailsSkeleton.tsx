export default function ProductDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading product details" aria-busy="true" className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 animate-pulse">
      {/* Product Image Column */}
      <div className="aspect-[3/4] w-full rounded-2xl bg-ink-3" />
      
      {/* Product Info Column */}
      <div className="flex flex-col justify-center space-y-6">
        <div className="space-y-3">
          {/* Breadcrumb line */}
          <div className="h-3 w-1/4 rounded bg-ink-3" />
          {/* Title */}
          <div className="h-8 w-3/4 rounded bg-ink-4" />
          {/* Rating */}
          <div className="h-4 w-1/3 rounded bg-ink-3" />
        </div>

        {/* Price */}
        <div className="h-6 w-1/4 rounded bg-ink-4" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-ink-3" />
          <div className="h-4 w-full rounded bg-ink-3" />
          <div className="h-4 w-2/3 rounded bg-ink-3" />
        </div>

        {/* Colors Select */}
        <div className="space-y-2">
          <div className="h-3.5 w-1/6 rounded bg-ink-3" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-ink-3" />
            <div className="h-8 w-8 rounded-full bg-ink-3" />
            <div className="h-8 w-8 rounded-full bg-ink-3" />
          </div>
        </div>

        {/* Sizes Select */}
        <div className="space-y-2">
          <div className="h-3.5 w-1/6 rounded bg-ink-3" />
          <div className="flex gap-2">
            <div className="h-10 w-10 rounded-full bg-ink-3" />
            <div className="h-10 w-10 rounded-full bg-ink-3" />
            <div className="h-10 w-10 rounded-full bg-ink-3" />
            <div className="h-10 w-10 rounded-full bg-ink-3" />
          </div>
        </div>

        {/* Add to Cart button */}
        <div className="h-12 w-full rounded-full bg-ink-4" />
      </div>
    </div>
  );
}
