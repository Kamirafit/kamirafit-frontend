"use client";

import { useState, type FormEvent } from "react";
import Container from "@/components/ui/Container";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl border border-gold/30 bg-ink-2 px-6 py-16 text-center sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,30,45,0.18),transparent_60%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
          />
          <p className="relative inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
            <span aria-hidden className="h-px w-8 bg-gold/60" />
            Newsletter
            <span aria-hidden className="h-px w-8 bg-gold/60" />
          </p>
          <h2 className="relative mt-4 font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
            Stay Updated
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-paper-muted sm:text-base">
            Early access to new drops, private sales, and the occasional styling
            note. No spam, ever.
          </p>

          <form
            onSubmit={handleSubmit}
            className="relative mx-auto mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full flex-1 rounded-full border border-line bg-ink/80 px-5 py-3 text-sm text-paper placeholder:text-paper-muted/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-ink shadow-[0_10px_30px_-12px_rgba(139,30,45,0.6)] transition-all duration-200 hover:-translate-y-px hover:bg-gold-bright hover:shadow-[0_14px_40px_-12px_rgba(139,30,45,0.75)]"
            >
              Subscribe
            </button>
          </form>

          {submitted ? (
            <p className="relative mt-5 text-xs text-gold">
              Thanks for subscribing — keep an eye on your inbox.
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
