export default function PanPage() {
  return (
    <div className="rounded-2xl border border-line bg-ink p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl font-bold text-paper">
        PAN Card Information
      </h1>
      <div className="mt-8 flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-ink-2 p-8 text-center">
        <svg
          className="h-16 w-16 text-paper-muted/40 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <h3 className="font-display text-lg font-medium text-paper">
          Coming Soon
        </h3>
        <p className="mt-2 max-w-md text-sm text-paper-muted">
          PAN Card linking functionality will be available in a future update. For now, this section serves as a placeholder.
        </p>
      </div>
    </div>
  );
}
