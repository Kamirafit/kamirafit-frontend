export default function OrderSkeleton() {
  return (
    <div role="status" aria-label="Loading orders" aria-busy="true" className="space-y-6 animate-pulse">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-line bg-ink p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-ink-4" />
              <div className="h-3.5 w-24 rounded bg-ink-3" />
            </div>
            <div className="h-8 w-20 rounded-full bg-ink-3" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-12 rounded bg-ink-3" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-ink-3" />
              <div className="h-3 w-1/4 rounded bg-ink-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
