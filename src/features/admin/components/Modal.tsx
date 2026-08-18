"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

const WIDTH: Record<NonNullable<Props["maxWidth"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-5xl",
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = "md",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[110] flex items-start justify-center p-3 sm:p-4 pt-[4vh] sm:pt-[8vh]"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/50 backdrop-blur-md"
      />
      <div
        className={`relative z-10 w-full ${WIDTH[maxWidth]} max-h-[92vh] sm:max-h-[85vh] overflow-y-auto modal-scrollbar-hidden rounded-2xl border border-white/15 bg-ink/90 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.6)] backdrop-blur-xl supports-[backdrop-filter]:bg-ink/75`}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line bg-ink/95 px-4 py-3.5 sm:px-6 sm:py-5 backdrop-blur-md">
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              <span aria-hidden className="h-px w-5 sm:w-6 bg-gold/60" />
              KamiraFit admin
            </span>
            <h2 className="font-display text-[17px] sm:text-[20px] font-semibold leading-tight text-paper">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="inline-flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-line text-paper-muted transition-colors hover:border-gold hover:text-gold"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>
  );
}
