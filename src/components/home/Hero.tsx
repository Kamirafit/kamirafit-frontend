"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { ArrowRightIcon } from "./icons";

export default function Hero() {
  const handleExploreCategories = () => {
    const el = document.getElementById("categories");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative isolate flex w-full items-center overflow-hidden border-b border-line bg-ink text-paper pt-1 sm:pt-2 lg:pt-2 pb-3 sm:pb-4 lg:pb-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-20 h-[340px] w-[340px] rounded-full bg-gold/5 blur-3xl"
      />

      <Container className="relative grid grid-cols-1 items-end gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 self-end lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink-2/60 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.28em] text-gold backdrop-blur">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_0_3px_rgba(139,30,45,0.2)]"
            />
            New Collection · 2026
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-paper sm:text-5xl lg:text-[48px] xl:text-[56px]">
            Elevate Your
            <br />
            <span className="italic text-gold">Everyday</span> Style.
          </h1>
          <p className="mt-3.5 max-w-xl text-base leading-relaxed text-paper-muted sm:text-lg">
            Premium comfort. Effortless fashion. Thoughtfully crafted essentials
            designed to move with you, day after day.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              scroll={true}
              className={`${buttonClasses("primary", "lg")} group`}
            >
              Shop Now
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={handleExploreCategories}
              className={buttonClasses("secondary", "lg")}
            >
              Explore Categories
            </button>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-6 border-t border-line pt-4">
            <div>
              <dt className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-gold">
                Crafted in
              </dt>
              <dd className="mt-1.5 font-display text-lg font-semibold text-paper sm:text-xl">
                India
              </dd>
            </div>
            <div>
              <dt className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-gold">
                Fit
              </dt>
              <dd className="mt-1.5 font-display text-lg font-semibold text-paper sm:text-xl">
                Tailored Comfort
              </dd>
            </div>
            <div>
              <dt className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-gold">
                Shipping
              </dt>
              <dd className="mt-1.5 font-display text-lg font-semibold text-paper sm:text-xl">
                Worldwide
              </dd>
            </div>
          </dl>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="group relative aspect-[4/5] w-full max-w-[540px] xl:max-w-[600px] max-h-[calc(100svh-5.5rem)] overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-[0_40px_80px_-40px_rgba(74,14,26,0.15)] transition-transform duration-700 hover:-translate-y-1">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              alt="Model wearing KamiraFit essentials"
              fill
              priority
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 540px, 100vw"
              className="object-cover"
            />
            {/* Shimmer light sweep on hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-[150%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/10"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
