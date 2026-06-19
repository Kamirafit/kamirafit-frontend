export default function AddressSkeleton() {
  return (
    <div role="status" aria-label="Loading addresses" aria-busy="true" className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-pulse">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-line bg-ink p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 w-24 rounded bg-ink-4" />
            <div className="h-5 w-16 rounded-full bg-ink-3" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-ink-3" />
            <div className="h-4 w-2/3 rounded bg-ink-3" />
            <div className="h-4 w-1/2 rounded bg-ink-3" />
          </div>
          <div className="flex gap-4 pt-2">
            <div className="h-4 w-12 rounded bg-ink-3" />
            <div className="h-4 w-12 rounded bg-ink-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
