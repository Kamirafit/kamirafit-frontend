import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Container from "./Container";

type Tone = "default" | "muted" | "inverted";

const TONE_CLASS: Record<Tone, string> = {
  default: "bg-ink text-paper",
  muted: "bg-ink-2 border-y border-line text-paper",
  inverted: "bg-paper text-ink",
};

type Props = {
  id?: string;
  tone?: Tone;
  /** Vertical padding scale. */
  padding?: "sm" | "md" | "lg";
  /** Wrap children in a <Container>. Set false to handle width manually. */
  bleed?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "className" | "children" | "id">;

const PADDING_CLASS: Record<NonNullable<Props["padding"]>, string> = {
  sm: "py-10 sm:py-12",
  md: "py-14 sm:py-16",
  lg: "py-16 sm:py-20",
};

/**
 * Page section wrapper. Standardises vertical rhythm + optional muted/dark
 * background + horizontal container, so every section on the homepage (and
 * inside product / cart / checkout pages) aligns and breathes the same.
 */
export default function Section({
  id,
  tone = "default",
  padding = "md",
  bleed = false,
  className = "",
  containerClassName = "",
  children,
  ...rest
}: Props) {
  const inner = (
    <div className={PADDING_CLASS[padding]}>{children}</div>
  );

  return (
    <section
      id={id}
      className={`relative ${TONE_CLASS[tone]} ${className}`.trim()}
      {...rest}
    >
      {bleed ? (
        inner
      ) : (
        <Container className={containerClassName}>{inner}</Container>
      )}
    </section>
  );
}
