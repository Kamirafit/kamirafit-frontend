"use client";

import { useEffect, useState, type FormEvent } from "react";
import { contactService } from "@/services/contact";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "@/data/countryCodes";

interface FormState {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  email: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
  message?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: Props) {
  const [formData, setFormData] = useState<FormState>({
    firstName: "",
    lastName: "",
    countryCode: DEFAULT_COUNTRY_CODE,
    phone: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Close on Escape key & manage body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose();
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, isSubmitting]);

  if (!open) return null;

  const validate = (data: FormState): FormErrors => {
    const errs: FormErrors = {};

    // First Name
    const trimmedFirst = data.firstName.trim();
    if (!trimmedFirst) {
      errs.firstName = "First name is required";
    } else if (trimmedFirst.length < 2) {
      errs.firstName = "First name must be at least 2 characters";
    } else if (!/^[A-Za-z\s'-]+$/.test(trimmedFirst)) {
      errs.firstName = "First name must contain letters only";
    }

    // Last Name
    const trimmedLast = data.lastName.trim();
    if (!trimmedLast) {
      errs.lastName = "Last name is required";
    } else if (!/^[A-Za-z\s'-]+$/.test(trimmedLast)) {
      errs.lastName = "Last name must contain letters only";
    }

    // Country Code
    if (!data.countryCode) {
      errs.countryCode = "Country code is required";
    }

    // Phone
    const cleanPhone = data.phone.replace(/[\s-]/g, "");
    if (!cleanPhone) {
      errs.phone = "Phone number is required";
    } else if (!/^\d+$/.test(cleanPhone)) {
      errs.phone = "Phone number must contain numbers only";
    } else if (data.countryCode === "+91" && cleanPhone.length !== 10) {
      errs.phone = "Please enter a valid 10-digit Indian phone number";
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errs.phone = "Phone number must be between 7 and 15 digits";
    }

    // Email
    const trimmedEmail = data.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      errs.email = "Please enter a valid email address (e.g., name@example.com)";
    }

    // Message
    const trimmedMessage = data.message.trim();
    if (!trimmedMessage) {
      errs.message = "Please write a message or inquiry";
    } else if (trimmedMessage.length < 10) {
      errs.message = "Message must be at least 10 characters long";
    } else if (trimmedMessage.length > 2000) {
      errs.message = "Message cannot exceed 2000 characters";
    }

    return errs;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (touched[field]) {
      const fieldErrors = validate(updated);
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field],
      }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldErrors[field],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const allTouched: Record<string, boolean> = {
      firstName: true,
      lastName: true,
      countryCode: true,
      phone: true,
      email: true,
      message: true,
    };
    setTouched(allTouched);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await contactService.submitQuery({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        countryCode: formData.countryCode.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
      setFormData({
        firstName: "",
        lastName: "",
        countryCode: DEFAULT_COUNTRY_CODE,
        phone: "",
        email: "",
        message: "",
      });
      setTouched({});
      setErrors({});
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to submit your inquiry. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contact Us Modal"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        onClick={isSubmitting ? undefined : handleResetAndClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-gold/30 bg-ink-2 px-6 py-8 sm:px-10 sm:py-10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        {/* Ambient Top Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={isSubmitting ? undefined : handleResetAndClose}
          disabled={isSubmitting}
          aria-label="Close modal"
          className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-line text-paper-muted transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
            <span aria-hidden className="h-px w-6 bg-gold/60" />
            Get In Touch
            <span aria-hidden className="h-px w-6 bg-gold/60" />
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-paper sm:text-4xl">
            Contact Us
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-paper-muted sm:text-sm">
            Have questions about styling, fits, or orders? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="mt-8 rounded-2xl border border-gold/40 bg-ink/90 p-8 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-2xl text-gold ring-1 ring-gold/40">
              ✓
            </div>
            <h3 className="mt-4 font-display text-2xl font-semibold text-paper">
              Message Received!
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-paper-muted sm:text-sm">
              Thank you for reaching out. A KamiraFit concierge will review your message and reply via email or phone shortly.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gold px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink shadow-sm transition-all hover:bg-gold-bright"
            >
              Done
            </button>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit}
            className="mt-7 space-y-4 text-left"
          >
            {submitError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-300">
                {submitError}
              </div>
            )}

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="modal-contact-first-name"
                  className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted"
                >
                  First Name <span className="text-gold">*</span>
                </label>
                <input
                  id="modal-contact-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  placeholder="First name"
                  className={`mt-1.5 w-full rounded-xl border bg-ink/80 px-3.5 py-2.5 text-xs sm:text-sm text-paper placeholder:text-paper-muted/50 transition-colors focus:outline-none ${
                    errors.firstName && touched.firstName
                      ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-line focus:border-gold focus:ring-1 focus:ring-gold/40"
                  }`}
                />
                {errors.firstName && touched.firstName && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                    <span aria-hidden>⚠</span> {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="modal-contact-last-name"
                  className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted"
                >
                  Last Name <span className="text-gold">*</span>
                </label>
                <input
                  id="modal-contact-last-name"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  placeholder="Last name"
                  className={`mt-1.5 w-full rounded-xl border bg-ink/80 px-3.5 py-2.5 text-xs sm:text-sm text-paper placeholder:text-paper-muted/50 transition-colors focus:outline-none ${
                    errors.lastName && touched.lastName
                      ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-line focus:border-gold focus:ring-1 focus:ring-gold/40"
                  }`}
                />
                {errors.lastName && touched.lastName && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                    <span aria-hidden>⚠</span> {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Country Code & Phone Number */}
            <div>
              <label
                htmlFor="modal-contact-phone"
                className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted"
              >
                Phone Number <span className="text-gold">*</span>
              </label>
              <div className="mt-1.5 flex gap-2">
                <select
                  id="modal-contact-country-code"
                  aria-label="Country Code"
                  value={formData.countryCode}
                  onChange={(e) => handleChange("countryCode", e.target.value)}
                  onBlur={() => handleBlur("countryCode")}
                  className="w-36 sm:w-44 rounded-xl border border-line bg-ink px-2.5 py-2.5 text-xs text-paper focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40 cursor-pointer"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={`${item.name}-${item.code}`} value={item.code} className="bg-ink text-paper">
                      {item.label}
                    </option>
                  ))}
                </select>
                <input
                  id="modal-contact-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  placeholder={formData.countryCode === "+91" ? "98765 43210" : "Phone number"}
                  className={`flex-1 rounded-xl border bg-ink/80 px-3.5 py-2.5 text-xs sm:text-sm text-paper placeholder:text-paper-muted/50 transition-colors focus:outline-none ${
                    errors.phone && touched.phone
                      ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-line focus:border-gold focus:ring-1 focus:ring-gold/40"
                  }`}
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                  <span aria-hidden>⚠</span> {errors.phone}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="modal-contact-email"
                className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted"
              >
                Email Address <span className="text-gold">*</span>
              </label>
              <input
                id="modal-contact-email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="you@example.com"
                className={`mt-1.5 w-full rounded-xl border bg-ink/80 px-3.5 py-2.5 text-xs sm:text-sm text-paper placeholder:text-paper-muted/50 transition-colors focus:outline-none ${
                  errors.email && touched.email
                    ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-line focus:border-gold focus:ring-1 focus:ring-gold/40"
                }`}
              />
              {errors.email && touched.email && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-400">
                  <span aria-hidden>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="modal-contact-message"
                className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted"
              >
                Message <span className="text-gold">*</span>
              </label>
              <textarea
                id="modal-contact-message"
                rows={3}
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                onBlur={() => handleBlur("message")}
                placeholder="Tell us what you are looking for, or how we can help..."
                className={`mt-1.5 w-full rounded-xl border bg-ink/80 px-3.5 py-2.5 text-xs sm:text-sm text-paper placeholder:text-paper-muted/50 transition-colors focus:outline-none resize-none ${
                  errors.message && touched.message
                    ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-line focus:border-gold focus:ring-1 focus:ring-gold/40"
                }`}
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                {errors.message && touched.message ? (
                  <p className="flex items-center gap-1 text-rose-400">
                    <span aria-hidden>⚠</span> {errors.message}
                  </p>
                ) : (
                  <span className="text-paper-muted/60">Minimum 10 characters</span>
                )}
                <span className="text-paper-muted/60">{formData.message.length}/2000</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-8 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink shadow-[0_10px_25px_-10px_rgba(139,30,45,0.6)] transition-all duration-200 hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                    Sending…
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
