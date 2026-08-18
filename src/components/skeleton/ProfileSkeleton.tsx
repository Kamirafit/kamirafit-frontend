export default function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" aria-busy="true" className="rounded-2xl border border-line bg-ink p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="h-6 w-1/4 rounded bg-ink-4 mb-4 animate-shimmer" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="h-3.5 w-1/4 rounded bg-ink-3 animate-shimmer" />
          <div className="h-10 w-full rounded-xl bg-ink-2 animate-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-1/4 rounded bg-ink-3 animate-shimmer" />
          <div className="h-10 w-full rounded-xl bg-ink-2 animate-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-1/4 rounded bg-ink-3 animate-shimmer" />
          <div className="h-10 w-full rounded-xl bg-ink-2 animate-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-1/4 rounded bg-ink-3 animate-shimmer" />
          <div className="h-10 w-full rounded-xl bg-ink-2 animate-shimmer" />
        </div>
      </div>
      <div className="h-10 w-32 rounded-full bg-ink-4 mt-6 animate-shimmer" />
    </div>
  );
}
