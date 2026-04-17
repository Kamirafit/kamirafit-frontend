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
      ? "text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl"
      : "text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl";

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
        action ? "" : "sm:flex-col sm:items-start"
      } ${className}`.trim()}
    >
      <div
        className={`flex flex-col gap-2 ${
          center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
        }`.trim()}
      >
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            {eyebrow}
          </p>
        ) : null}
        <Heading className={headingClass}>{title}</Heading>
        {description ? (
          <p className="text-sm leading-relaxed text-neutral-600 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
