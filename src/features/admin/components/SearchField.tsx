"use client";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

/**
 * Shared search input used across admin list pages. Inherits the storefront
 * form style (pill-shaped, gold focus ring).
 */
export default function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  label,
  className = "",
}: Props) {
  return (
    <label className={`relative block w-full ${className}`.trim()}>
      {label ? (
        <span className="sr-only">{label}</span>
      ) : null}
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-paper-muted">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-line bg-ink-2 px-4 py-2.5 pl-10 text-[13px] text-paper placeholder:text-paper-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />
    </label>
  );
}
