import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-bold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed select-none";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-container text-white shadow-md hover:bg-primary hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:bg-primary disabled:bg-primary-container/50 disabled:text-white/70 disabled:shadow-none disabled:hover:translate-y-0",
  secondary:
    "border border-primary/50 bg-transparent text-primary hover:border-primary hover:bg-primary-container hover:text-white disabled:border-outline-variant disabled:text-outline disabled:hover:bg-transparent disabled:hover:text-outline",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-primary disabled:text-outline/40",
  dark: "bg-surface-container text-primary border border-outline-variant/60 hover:border-primary hover:text-primary disabled:text-outline/40",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[11px] uppercase tracking-[0.14em]",
  md: "px-6 py-3 text-[12px] uppercase tracking-[0.16em]",
  lg: "px-8 py-4 text-[12px] uppercase tracking-[0.18em]",
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
