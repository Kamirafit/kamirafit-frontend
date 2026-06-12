import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Optional element rendered on the right (e.g. "View all →"). */
  action?: ReactNode;
  /** If true, center the header block. */
  center?: boolean;
  /** Visual scale. "lg" renders an h1-sized heading, "md" is the default h2. */
  size?: "md" | "lg";
  className?: string;
};

/**
 * Shared eyebrow + heading + description block used across the homepage
 * sections, the shop / cart / checkout page headers, and the product details
 * page. Renders an `<h2>` by default; pass `size="lg"` for page-level headers.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  center = false,
  size = "md",
  className = "",
}: Props) {
  const Heading = size === "lg" ? "h1" : "h2";
  const headingClass =
    size === "lg"
      ? "font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper sm:text-5xl lg:text-[56px]"
      : "font-display text-3xl font-semibold leading-[1.1] tracking-tight text-paper sm:text-4xl lg:text-[42px]";

  return (
    <div
      className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${
        action ? "" : "sm:flex-col sm:items-start"
      } ${className}`.trim()}
    >
      <div
        className={`flex flex-col gap-3 ${
          center ? "mx-auto max-w-2xl items-center text-center" : "max-w-2xl"
        }`.trim()}
      >
        {eyebrow ? (
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
            <span aria-hidden className="h-px w-8 bg-gold/60" />
            {eyebrow}
          </p>
        ) : null}
        <Heading className={headingClass}>{title}</Heading>
        {description ? (
          <p className="max-w-xl text-sm leading-relaxed text-paper-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
