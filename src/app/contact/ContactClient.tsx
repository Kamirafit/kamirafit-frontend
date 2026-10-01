"use client";

import { useState, useEffect } from "react";
import { contactService } from "@/services/contact";
import { useProfile } from "@/features/auth/hooks";
import { useAppSelector } from "@/features/product/hooks/redux";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function ContactClient() {
  const auth = useAppSelector((state) => state.auth);
  const { data: profile } = useProfile();
  const isLoggedIn = auth.isAuthenticated || Boolean(profile);
  const user = profile || auth.user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    countryCode: "+91",
    phone: "",
    email: "",
    message: "",
  });

  // Auto-fill when logged in, but remains fully editable
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || "",
        lastName: prev.lastName || user.lastName || "",
        email: prev.email || user.email || "",
        countryCode: prev.countryCode || user.countryCode || "+91",
        phone: prev.phone || user.phoneNumber || user.mobileNumber?.replace(/^\+\d+\s*/, "") || "",
      }));
    }
  }, [isLoggedIn, user]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateField = (name: keyof typeof formData, value: string): string => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2) return "First name must be at least 2 characters";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "First name cannot contain numbers or special characters";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Last name cannot contain numbers or special characters";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          return "Please enter a valid email address (e.g. name@domain.com)";
        return "";
      case "phone": {
        const clean = value.replace(/\D/g, "");
        if (!value.trim()) return "Phone number is required";
        if (clean.length !== 10) return "Please enter a valid 10-digit mobile number";
        return "";
      }
      case "message":
        if (!value.trim()) return "Please write your inquiry or message";
        if (value.trim().length < 10) return "Message must be at least 10 characters long";
        return "";
      default:
        return "";
    }
  };

  const validateAll = (): boolean => {
    const nextErrors: FormErrors = {};
    const fnErr = validateField("firstName", formData.firstName);
    if (fnErr) nextErrors.firstName = fnErr;

    const lnErr = validateField("lastName", formData.lastName);
    if (lnErr) nextErrors.lastName = lnErr;

    const emErr = validateField("email", formData.email);
    if (emErr) nextErrors.email = emErr;

    const phErr = validateField("phone", formData.phone);
    if (phErr) nextErrors.phone = phErr;

    const msgErr = validateField("message", formData.message);
    if (msgErr) nextErrors.message = msgErr;

    setErrors(nextErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      message: true,
    });
    return Object.keys(nextErrors).length === 0;
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    let sanitized = value;
    if (field === "firstName" || field === "lastName") {
      sanitized = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (field === "phone") {
      sanitized = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
    if (touched[field]) {
      const err = validateField(field, sanitized);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateAll()) return;

    setStatus("submitting");

    try {
      await contactService.submitQuery({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        countryCode: formData.countryCode,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });
      setStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        countryCode: "+91",
        phone: "",
        email: "",
        message: "",
      });
      setTouched({});
      setErrors({});
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit your message. Please try again or email us directly.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
      <div className="border-b border-line pb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Get In Touch</span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-paper sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-sm text-paper-muted">We are here to assist with sizing, order updates, or custom inquiries.</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Contact Information */}
        <div className="space-y-8 lg:col-span-5">
          <div>
            <h2 className="font-display text-lg font-medium text-paper">Customer Care</h2>
            <p className="mt-2 text-sm text-paper-muted">
              Our support team is available Monday through Saturday to ensure you have a flawless shopping experience.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-xl border border-line bg-ink-2/40 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">Email Concierge</span>
              <p className="mt-1 text-paper font-medium">support@kamirafit.com</p>
              <p className="text-xs text-paper-muted mt-0.5">Response within 24 business hours</p>
            </div>

            <div className="rounded-xl border border-line bg-ink-2/40 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">Business Hours</span>
              <p className="mt-1 text-paper font-medium">Mon – Sat: 10:00 AM – 7:00 PM IST</p>
              <p className="text-xs text-paper-muted mt-0.5">Excluding national and public holidays</p>
            </div>

            <div className="rounded-xl border border-line bg-ink-2/40 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">Brand Headquarters</span>
              <p className="mt-1 text-paper font-medium">KAMIRAFIT CREATION PVT LTD</p>
              <p className="text-xs text-paper-muted mt-0.5">9, Bijoy Basu Road, Bhawanipore, Kolkata - 700025, West Bengal, India</p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="rounded-2xl border border-line bg-ink-2/30 p-6 sm:p-8 lg:col-span-7">
          <h2 className="font-display text-xl font-medium text-paper">Send a Message</h2>
          <p className="mt-1 text-xs text-paper-muted">Fill out the form below and our team will get back to you promptly.</p>

          {status === "success" && (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
              Thank you! Your message has been received. A customer representative will reach out shortly.
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-xs font-semibold text-red-900 shadow-sm flex items-start gap-2">
              <span className="text-red-600 font-bold">⚠️</span>
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-paper-muted">
                  First Name <span className="text-gold">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  className={`mt-1.5 w-full rounded-lg border bg-ink px-3 py-2 text-xs text-paper placeholder-paper-muted/50 transition-colors focus:outline-none ${
                    touched.firstName && errors.firstName
                      ? "border-red-500/80 bg-red-500/5 focus:border-red-500"
                      : "border-line focus:border-gold"
                  }`}
                  placeholder="Arjun"
                />
                {touched.firstName && errors.firstName && (
                  <p className="mt-1 text-xs text-red-700 font-semibold flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-paper-muted">
                  Last Name <span className="text-gold">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  className={`mt-1.5 w-full rounded-lg border bg-ink px-3 py-2 text-xs text-paper placeholder-paper-muted/50 transition-colors focus:outline-none ${
                    touched.lastName && errors.lastName
                      ? "border-red-500/80 bg-red-500/5 focus:border-red-500"
                      : "border-line focus:border-gold"
                  }`}
                  placeholder="Sharma"
                />
                {touched.lastName && errors.lastName && (
                  <p className="mt-1 text-xs text-red-700 font-semibold flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-paper-muted">
                  Email Address <span className="text-gold">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`mt-1.5 w-full rounded-lg border bg-ink px-3 py-2 text-xs text-paper placeholder-paper-muted/50 transition-colors focus:outline-none ${
                    touched.email && errors.email
                      ? "border-red-500/80 bg-red-500/5 focus:border-red-500"
                      : "border-line focus:border-gold"
                  }`}
                  placeholder="arjun@example.com"
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-xs text-red-700 font-semibold flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-paper-muted">
                  Phone Number <span className="text-gold">*</span>
                </label>
                <div className={`mt-1.5 flex rounded-lg border bg-ink transition-colors ${
                  touched.phone && errors.phone
                    ? "border-red-500/80 bg-red-500/5 focus-within:border-red-500"
                    : "border-line focus-within:border-gold"
                }`}>
                  <span className="inline-flex items-center px-3 text-xs text-paper-muted border-r border-line">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className="w-full bg-transparent px-3 py-2 text-xs text-paper placeholder-paper-muted/50 focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-xs text-red-700 font-semibold flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-medium text-paper-muted">
                Message <span className="text-gold">*</span>
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                onBlur={() => handleBlur("message")}
                className={`mt-1.5 w-full rounded-lg border bg-ink px-3 py-2 text-xs text-paper placeholder-paper-muted/50 transition-colors focus:outline-none resize-none ${
                  touched.message && errors.message
                    ? "border-red-500/80 bg-red-500/5 focus:border-red-500"
                    : "border-line focus:border-gold"
                }`}
                placeholder="How can we assist you today?"
              />
              {touched.message && errors.message && (
                <p className="mt-1 text-xs text-red-700 font-semibold flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-600" />
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-xl bg-gold py-3 text-xs font-semibold tracking-wider uppercase text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "submitting" ? "Sending..." : "Submit Inquiry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
