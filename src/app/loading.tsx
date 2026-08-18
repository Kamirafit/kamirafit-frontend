import Container from "@/components/ui/Container";
import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-ink-2 pb-16">
      {/* Hero Skeleton */}
      <div className="w-full bg-ink py-16 sm:py-24 border-b border-line">
        <Container className="flex flex-col items-center text-center space-y-4">
          <div className="h-4 w-32 rounded-full bg-ink-4 animate-shimmer" />
          <div className="h-10 w-3/4 max-w-lg rounded-xl bg-ink-3 animate-shimmer" />
          <div className="h-4 w-1/2 max-w-md rounded bg-ink-3 animate-shimmer" />
          <div className="mt-4 flex gap-3">
            <div className="h-11 w-32 rounded-full bg-ink-4 animate-shimmer" />
            <div className="h-11 w-32 rounded-full bg-ink-3 animate-shimmer" />
          </div>
        </Container>
      </div>

      {/* Category Pills Skeleton */}
      <Container className="py-8">
        <div className="flex gap-3 overflow-hidden pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-28 shrink-0 rounded-full bg-ink-3 animate-shimmer" />
          ))}
        </div>
      </Container>

      {/* Products Grid Skeleton */}
      <Container className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-36 rounded bg-ink-4 animate-shimmer" />
          <div className="h-4 w-20 rounded bg-ink-3 animate-shimmer" />
        </div>
        <ProductGridSkeleton count={8} />
      </Container>
    </div>
  );
}
