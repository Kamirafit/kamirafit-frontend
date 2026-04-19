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
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Small row-level action pill. Used in every admin table (Edit / Delete /
 * Activate / Deactivate). Shared so all admin rows look identical.
 */
export default function ActionButton({
  tone = "neutral",
  className = "",
  children,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`rounded-full border px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${TONE_CLASS[tone]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
