import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed select-none";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-white shadow-[0_10px_30px_-12px_rgba(139,30,45,0.55)] hover:bg-gold-bright hover:-translate-y-px hover:shadow-[0_14px_40px_-12px_rgba(139,30,45,0.7)] active:translate-y-0 active:bg-gold disabled:bg-gold-dim disabled:text-white/70 disabled:shadow-none disabled:hover:translate-y-0",
  secondary:
    "border border-gold/70 bg-transparent text-gold hover:border-gold hover:bg-gold hover:text-white disabled:border-line disabled:text-paper-muted disabled:hover:bg-transparent disabled:hover:text-paper-muted",
  ghost:
    "bg-transparent text-paper-muted hover:bg-ink-3 hover:text-gold disabled:text-paper-muted/40",
  dark: "bg-ink-2 text-paper border border-line hover:border-gold hover:text-gold disabled:text-paper-muted/40",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[11px] uppercase tracking-[0.14em]",
  md: "px-6 py-3 text-[12px] uppercase tracking-[0.16em]",
  lg: "px-8 py-4 text-[12px] uppercase tracking-[0.2em]",
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Returns the className string for a button/link styled as a button.
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
  loading?: boolean;
  loadingText?: ReactNode;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingText,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: Props) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={buttonClasses(
        variant,
        size,
        `${fullWidth ? "w-full" : ""} ${loading ? "opacity-75 pointer-events-none cursor-wait" : ""} ${className}`.trim(),
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
