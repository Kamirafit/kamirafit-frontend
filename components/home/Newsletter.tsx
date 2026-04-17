"use client";

import { useState, type FormEvent } from "react";

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
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-neutral-900 px-6 py-14 text-center text-white sm:px-12 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Newsletter
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Stay Updated
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
          Early access to new drops, private sales, and the occasional styling
          note. No spam, ever.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row"
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
            className="w-full flex-1 rounded-full border border-neutral-700 bg-neutral-800 px-5 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            Subscribe
          </button>
        </form>

        {submitted ? (
          <p className="mt-4 text-xs text-neutral-300">
            Thanks for subscribing — keep an eye on your inbox.
          </p>
        ) : null}
      </div>
    </section>
  );
}
