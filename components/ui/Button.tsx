import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 disabled:cursor-not-allowed";

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-neutral-900 text-white hover:bg-neutral-700 disabled:bg-neutral-400",
  secondary:
    "border border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900 disabled:border-neutral-200 disabled:text-neutral-400",
  ghost:
    "bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 disabled:text-neutral-300",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-sm",
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
