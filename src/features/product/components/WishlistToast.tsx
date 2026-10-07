"use client";

import { useEffect } from "react";
import { CheckCircleIcon, ShoppingBagIcon, HeartIcon, CloseIcon } from "./icons";

export type ToastMessage = {
  id: string;
  text: string;
  icon?: "check" | "bag" | "heart" | "remove" | "share";
};

type Props = {
  toast: ToastMessage | null;
  onDismiss: () => void;
};

export default function WishlistToast({ toast, onDismiss }: Props) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3 bg-primary text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 max-w-sm sm:max-w-md border border-white/10"
    >
      <span className="flex-shrink-0 text-secondary-fixed">
        {toast.icon === "bag" ? (
          <ShoppingBagIcon width={18} height={18} />
        ) : toast.icon === "heart" ? (
          <HeartIcon filled width={18} height={18} />
        ) : toast.icon === "remove" ? (
          <CloseIcon width={16} height={16} />
        ) : (
          <CheckCircleIcon width={18} height={18} />
        )}
      </span>
      <span className="font-sans text-xs sm:text-sm font-medium leading-snug line-clamp-2">
        {toast.text}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="ml-auto -mr-1 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <CloseIcon width={14} height={14} />
      </button>
    </aside>
  );
}
