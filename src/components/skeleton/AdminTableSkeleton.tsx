export default function AdminTableSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-ink overflow-hidden animate-pulse">
      {/* Table Header */}
      <div className="flex border-b border-line bg-ink-2 px-6 py-4 space-x-4">
        <div className="h-4 w-1/4 rounded bg-ink-4" />
        <div className="h-4 w-1/4 rounded bg-ink-4" />
        <div className="h-4 w-1/4 rounded bg-ink-4" />
        <div className="h-4 w-1/4 rounded bg-ink-4" />
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-line/60">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex px-6 py-4 space-x-4">
            <div className="h-4 w-1/4 rounded bg-ink-3" />
            <div className="h-4 w-1/4 rounded bg-ink-3" />
            <div className="h-4 w-1/4 rounded bg-ink-3" />
            <div className="h-4 w-1/4 rounded bg-ink-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
