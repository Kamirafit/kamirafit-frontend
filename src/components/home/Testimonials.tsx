"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { useTestimonials } from "@/services/testimonial";
import type { Testimonial } from "@/types/entities";

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "ava",
    name: "Ava Thompson",
    location: "Brooklyn, NY",
    quote:
      "The fit, the fabric, the finish — everything feels considered. My KamiraFit tees have replaced half my wardrobe.",
    rating: 5,
    order: 0,
    isActive: true,
  },
  {
    name: "Marcus Lee",
    id: "marcus",
    location: "London, UK",
    quote:
      "Finally, a brand that nails the basics. The hoodie is the softest thing I own and the cut is effortlessly modern.",
    rating: 5,
    order: 1,
    isActive: true,
  },
  {
    id: "sofia",
    name: "Sofia Álvarez",
    location: "Lisbon, PT",
    quote:
      "Quiet luxury at an honest price. I appreciate the attention to detail and the ethical supply chain.",
    rating: 5,
    order: 2,
    isActive: true,
  },
];

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1 text-gold/90" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function Testimonials() {
  const { data: serverTestimonials } = useTestimonials();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Maximum 10 testimonials as requested
  const items = (serverTestimonials && serverTestimonials.length > 0
    ? serverTestimonials
    : DEFAULT_TESTIMONIALS
  ).slice(0, 10);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items.length]);

  const handleScrollLeft = () => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 360;
    scrollRef.current.scrollBy({ left: -(cardWidth + 24), behavior: "smooth" });
  };

  const handleScrollRight = () => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 360;
    scrollRef.current.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
  };

  return (
    <Section tone="muted">
      <SectionHeader
        eyebrow="Loved by"
        title="What our customers are saying."
        description="Authentic experiences from individuals who choose intentional everyday luxury."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ink text-paper shadow-sm transition-all duration-200 hover:border-gold hover:text-gold active:scale-95 disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ink text-paper shadow-sm transition-all duration-200 hover:border-gold hover:text-gold active:scale-95 disabled:pointer-events-none disabled:opacity-25"
            >
              <ChevronRightIcon />
            </button>
          </div>
        }
      />

      {/* Horizontal Scrollable Carousel Track */}
      <div
        ref={scrollRef}
        className="mt-10 flex gap-6 overflow-x-auto scroll-smooth pb-4 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-12 lg:gap-8"
        tabIndex={0}
        role="region"
        aria-label="Customer testimonials carousel"
      >
        {items.map((t) => (
          <figure
            key={t.id}
            className="relative flex h-full min-w-[290px] max-w-[380px] flex-1 shrink-0 snap-start flex-col justify-between rounded-2xl border border-line bg-ink p-7 sm:min-w-[340px] sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_30px_60px_-30px_rgba(139,30,45,0.2)]"
          >
            <div className="flex items-center justify-between gap-4">
              <span
                aria-hidden
                className="font-display text-4xl leading-none text-gold/40 select-none"
              >
                “
              </span>
              <StarRating rating={t.rating ?? 5} />
            </div>

            <blockquote className="relative z-10 pt-5 text-sm leading-relaxed text-paper sm:text-base">
              {t.quote}
            </blockquote>

            <figcaption className="mt-8 border-t border-line/80 pt-5">
              <p className="font-display text-sm font-semibold text-paper">
                {t.name}
              </p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-paper-muted">
                {t.location}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
