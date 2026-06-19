type Props = { label?: string; className?: string };

export default function LoadingState({ label = "Loading…", className = "" }: Props) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={`flex min-h-48 items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3 text-paper-muted">
        <span aria-hidden className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
