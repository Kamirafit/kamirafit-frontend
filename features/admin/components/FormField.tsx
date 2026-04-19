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
    <label className={`flex flex-col gap-1.5 ${className}`} htmlFor={htmlFor}>
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-paper-muted">
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

export const inputClass =
  "w-full rounded-lg border border-line bg-ink-2 px-3 py-2.5 text-[13.5px] text-paper placeholder:text-paper-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

export const textareaClass = `${inputClass} min-h-[90px] resize-y`;
