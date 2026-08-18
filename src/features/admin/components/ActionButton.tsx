"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "neutral" | "danger" | "success" | "warning";

const TONE_CLASS: Record<Tone, string> = {
  neutral:
    "border-line text-paper hover:border-gold hover:text-gold",
  danger:
    "border-line text-paper-muted hover:border-[#B3261E] hover:text-[#B3261E]",
  warning:
    "border-[#B3261E]/40 text-[#B3261E] hover:bg-[#B3261E]/10",
  success:
    "border-[#16A34A]/40 text-[#16A34A] hover:bg-[#16A34A]/10",
};

type Props = {
  tone?: Tone;
  loading?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function ActionButton({
  tone = "neutral",
  loading = false,
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${TONE_CLASS[tone]} ${
        loading ? "opacity-75 pointer-events-none cursor-wait" : ""
      } ${className}`.trim()}
      {...rest}
    >
      {loading ? (
        <svg
          className="animate-spin shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          width="11"
          height="11"
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
      ) : null}
      <span>{children}</span>
    </button>
  );
}
