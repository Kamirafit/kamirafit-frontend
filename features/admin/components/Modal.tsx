"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
};

const WIDTH: Record<NonNullable<Props["maxWidth"]>, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
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
      className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-[8vh] sm:pt-[10vh]"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-sm"
      />
      <div
        className={`relative z-10 w-full ${WIDTH[maxWidth]} max-h-[85vh] overflow-y-auto rounded-2xl border border-line bg-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.55)]`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2 className="font-display text-[17px] font-semibold text-paper">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-paper-muted transition-colors hover:bg-ink-2 hover:text-paper"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
