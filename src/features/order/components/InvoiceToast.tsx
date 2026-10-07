"use client";

import { useEffect } from "react";

type InvoiceToastProps = {
  invoiceNumber: string;
  isVisible: boolean;
  onClose: () => void;
};

export default function InvoiceToast({ invoiceNumber, isVisible, onClose }: InvoiceToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 transform transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="bg-[#2f020b] text-[#ffffff] px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 flex items-center gap-3.5 max-w-sm backdrop-blur-md">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#8d4a52]">
          <svg
            className="w-5 h-5 text-[#ffdadc]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="min-w-0 pr-2">
          <p className="text-xs font-semibold text-white tracking-wide truncate">
            {invoiceNumber.startsWith("#") ? `Invoice ${invoiceNumber}` : `Invoice #${invoiceNumber}`}
          </p>
          <p className="text-[11px] text-[#ffb2b9] font-light leading-snug">
            Prepared and downloaded to your device
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="ml-auto text-white/50 hover:text-white transition-colors p-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
