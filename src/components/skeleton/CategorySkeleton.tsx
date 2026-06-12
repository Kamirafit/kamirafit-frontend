export default function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center rounded-2xl border border-line bg-ink p-4 space-y-3"
        >
          <div className="h-10 w-10 rounded-full bg-ink-3" />
          <div className="h-3 w-2/3 rounded bg-ink-3" />
        </div>
      ))}
    </div>
  );
}
