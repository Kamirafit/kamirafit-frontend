import StateShell from "./StateShell";

type Props = { onRetry?: () => void; className?: string };

export default function OfflineState({ onRetry, className }: Props) {
  return (
    <StateShell
      role="alert"
      icon="↯"
      title="You’re offline"
      description="Check your connection. You can retry once you’re back online."
      className={className}
      action={onRetry ? <button type="button" onClick={onRetry} className="rounded-full border border-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Retry</button> : undefined}
    />
  );
}
