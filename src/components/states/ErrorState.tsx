import Link from "next/link";
import StateShell from "./StateShell";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  actionHref?: string;
  className?: string;
};

export default function ErrorState({
  title = "We hit a snag",
  message = "We couldn’t load this right now. Please try again.",
  onRetry,
  retryLabel = "Try again",
  actionHref,
  className,
}: Props) {
  const actionNode = actionHref ? (
    <Link
      href={actionHref}
      className="inline-block rounded-full bg-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
    >
      {retryLabel}
    </Link>
  ) : onRetry ? (
    <button
      type="button"
      onClick={onRetry}
      className="rounded-full bg-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
    >
      {retryLabel}
    </button>
  ) : undefined;

  return (
    <StateShell
      role="alert"
      icon="!"
      title={title}
      description={message}
      className={className}
      action={actionNode}
    />
  );
}
