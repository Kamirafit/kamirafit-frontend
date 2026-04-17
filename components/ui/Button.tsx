import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink shadow-[0_10px_30px_-12px_rgba(212,175,55,0.55)] hover:bg-gold-bright hover:-translate-y-px hover:shadow-[0_14px_40px_-12px_rgba(212,175,55,0.7)] active:translate-y-0 active:bg-gold disabled:bg-gold-dim disabled:text-paper/70 disabled:shadow-none disabled:hover:translate-y-0",
  secondary:
    "border border-gold/70 bg-transparent text-gold hover:border-gold hover:bg-gold hover:text-ink disabled:border-line disabled:text-paper-muted disabled:hover:bg-transparent disabled:hover:text-paper-muted",
  ghost:
    "bg-transparent text-paper-muted hover:bg-ink-3 hover:text-gold disabled:text-paper-muted/40",
  dark: "bg-ink-2 text-paper border border-line hover:border-gold hover:text-gold disabled:text-paper-muted/40",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[11px] uppercase tracking-[0.14em]",
  md: "px-6 py-3 text-[12px] uppercase tracking-[0.16em]",
  lg: "px-8 py-4 text-[12px] uppercase tracking-[0.2em]",
};

/**
 * Returns the className string for a button/link styled as a button. Use this
 * on <Link> / <a> elements where a full component wrapper would be awkward.
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
) {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${extra}`.trim();
}

type Props = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={buttonClasses(
        variant,
        size,
        `${fullWidth ? "w-full" : ""} ${className}`.trim(),
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
