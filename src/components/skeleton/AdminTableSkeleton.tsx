export default function AdminTableSkeleton() {
  return (
    <div role="status" aria-label="Loading table" aria-busy="true" className="rounded-2xl border border-line bg-ink overflow-hidden shadow-sm">
      {/* Table Header */}
      <div className="flex border-b border-line bg-ink-2/80 px-6 py-4 space-x-4">
        <div className="h-4 w-1/4 rounded bg-ink-4 animate-shimmer" />
        <div className="h-4 w-1/4 rounded bg-ink-4 animate-shimmer" />
        <div className="h-4 w-1/4 rounded bg-ink-4 animate-shimmer" />
        <div className="h-4 w-1/4 rounded bg-ink-4 animate-shimmer" />
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-line/60">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex items-center px-6 py-4 space-x-4">
            <div className="h-4 w-1/4 rounded bg-ink-3/80 animate-shimmer" />
            <div className="h-4 w-1/4 rounded bg-ink-3/80 animate-shimmer" />
            <div className="h-4 w-1/4 rounded bg-ink-3/80 animate-shimmer" />
            <div className="h-7 w-20 ml-auto rounded-full bg-ink-3/80 animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}
