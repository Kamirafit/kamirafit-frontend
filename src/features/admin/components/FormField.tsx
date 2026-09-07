import type { ReactNode } from "react";

type Props = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export default function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: Props) {
  return (
    <label className={`flex flex-col gap-2 ${className}`.trim()} htmlFor={htmlFor}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
        {label}
      </span>
      {children}
      {hint && !error ? (
        <span className="text-[11.5px] text-paper-muted">{hint}</span>
      ) : null}
      {error ? (
        <span className="text-[11.5px] font-medium text-[#B3261E]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

/**
 * Shared input/select style. Pill-shaped to echo the storefront's rounded-full
 * CTAs and the header search input.
 */
export const inputClass =
  "w-full rounded-full border border-line bg-ink-2 px-4 py-2.5 text-[13.5px] text-paper placeholder:text-paper-muted/70 transition-colors focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

/**
 * Select style — identical to `inputClass` but with extra right padding so the
 * native dropdown chevron has breathing room from the right edge. Fixes the
 * "arrow too close to edge" issue without swapping to a custom select.
 */
export const selectClass =
  "w-full rounded-full border border-line bg-ink-2 pl-4 pr-10 py-2.5 text-[13.5px] text-paper placeholder:text-paper-muted/70 transition-colors focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

/**
 * Textareas keep a rounded-2xl shape because they're multi-line — matches the
 * `rounded-2xl` used on storefront product cards and admin card shells.
 */
export const textareaClass =
  "w-full min-h-[96px] resize-y rounded-2xl border border-line bg-ink-2 px-4 py-3 text-[13.5px] leading-relaxed text-paper placeholder:text-paper-muted/70 transition-colors focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
