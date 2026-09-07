"use client";

import { useState } from "react";
import PageShell from "@/components/layout/PageShell";
import { contactService } from "@/services/contact";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    countryCode: "+91",
    phone: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      await contactService.submitQuery(formData);
      setStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        countryCode: "+91",
        phone: "",
        email: "",
        message: "",
      });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit your message. Please try again or email us directly.");
    }
  };

  return (
    <PageShell>
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
                <p className="mt-1 text-paper font-medium">KamiraFit Retail & Design Studio</p>
                <p className="text-xs text-paper-muted mt-0.5">123 Fashion Street, Bandra West, Mumbai, Maharashtra - 400050, India</p>
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
              <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-paper-muted">
                    First Name <span className="text-gold">*</span>
                  </label>
                  <input
                    id="firstName"
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-line bg-ink px-3 py-2 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none"
                    placeholder="Arjun"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-paper-muted">
                    Last Name <span className="text-gold">*</span>
                  </label>
                  <input
                    id="lastName"
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-line bg-ink px-3 py-2 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none"
                    placeholder="Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-paper-muted">
                    Email Address <span className="text-gold">*</span>
                  </label>
                  <input
                    id="email"
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-line bg-ink px-3 py-2 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none"
                    placeholder="arjun@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-paper-muted">
                    Phone Number <span className="text-gold">*</span>
                  </label>
                  <div className="mt-1.5 flex rounded-lg border border-line bg-ink focus-within:border-gold">
                    <span className="inline-flex items-center px-3 text-xs text-paper-muted border-r border-line">+91</span>
                    <input
                      id="phone"
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-transparent px-3 py-2 text-xs text-paper placeholder-paper-muted/50 focus:outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-medium text-paper-muted">
                  Message <span className="text-gold">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-line bg-ink px-3 py-2 text-xs text-paper placeholder-paper-muted/50 focus:border-gold focus:outline-none resize-none"
                  placeholder="How can we assist you today?"
                />
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
    </PageShell>
  );
}
