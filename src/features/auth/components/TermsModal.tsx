"use client";

import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  isAccepted?: boolean;
}

export default function TermsModal({
  open,
  onClose,
  onAccept,
  isAccepted = false,
}: TermsModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn"
    >
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative flex flex-col w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] rounded-2xl border border-line bg-ink shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-2/95 px-5 py-4 backdrop-blur-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              Legal Agreement
            </span>
            <h2
              id="terms-modal-title"
              className="mt-0.5 font-display text-lg sm:text-xl font-semibold text-paper"
            >
              Terms of Service
            </h2>
            <p className="text-[11px] text-paper-muted">
              Effective Date: September 2026
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-line text-paper-muted hover:border-gold hover:text-paper transition-colors focus:outline-none"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 space-y-6 text-xs sm:text-sm text-paper-muted leading-relaxed"
        >
          <section className="space-y-2">
            <h3 className="font-display text-sm sm:text-base font-semibold text-paper">
              1. Acceptance of Terms
            </h3>
            <p>
              By accessing, browsing, creating an account, or placing an order on the KamiraFit platform (kamirafit.com), you acknowledge and agree to be bound by these Terms of Service, along with our Privacy Policy, Shipping Policy, and Return Policy. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-sm sm:text-base font-semibold text-paper">
              2. Eligibility & Account Responsibilities
            </h3>
            <p>
              You must be at least 18 years of age or accessing under the supervision of a parent or legal guardian. When registering an account or making a purchase, you agree to provide authentic, accurate, and current information. You are strictly responsible for safeguarding your login credentials and one-time verification tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-sm sm:text-base font-semibold text-paper">
              3. Product Descriptions & Pricing
            </h3>
            <p>
              We strive to display the colors, fabrics, and fit of our garments as accurately as possible. However, individual screen calibration may subtly alter apparent coloration. All prices are listed in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless specified otherwise. We reserve the right to correct typographical pricing errors before order fulfillment.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-sm sm:text-base font-semibold text-paper">
              4. Order Confirmation & Fulfillment
            </h3>
            <p>
              Receipt of an order confirmation email indicates receipt of your order request, not acceptance of your order. KamiraFit reserves the right to accept or decline orders due to stock unavailability, pricing inaccuracies, or unauthorized/fraudulent payment suspicion. In any such cancellation, deducted funds will be refunded promptly.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-sm sm:text-base font-semibold text-paper">
              5. Intellectual Property
            </h3>
            <p>
              All visual trademarks, brand signatures, graphics, imagery, custom garment designs, and web assets are the proprietary intellectual property of KamiraFit Creation Pvt Ltd. Unauthorized reproduction, modification, or commercial exploitation is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-sm sm:text-base font-semibold text-paper">
              6. Governing Law & Jurisdiction
            </h3>
            <p>
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms or transactions shall be subject to the exclusive jurisdiction of the competent courts in Kolkata, West Bengal, India.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between border-t border-line bg-ink-2/95 px-5 py-3.5 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-paper-muted hover:text-paper border border-line rounded-xl hover:border-gold transition-colors"
          >
            Close
          </button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAccept}
            className="text-xs font-semibold uppercase tracking-wider px-5 py-2 rounded-xl"
          >
            {isAccepted ? "Accepted ✓" : "Accept Terms"}
          </Button>
        </div>
      </div>
    </div>
  );
}
