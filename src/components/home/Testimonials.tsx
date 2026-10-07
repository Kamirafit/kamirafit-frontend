"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTestimonials } from "@/services/testimonial";
import type { Testimonial } from "@/types/entities";

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "ava",
    name: "Ava Thompson",
    location: "Brooklyn, NY",
    quote:
      "The fit, the fabric, the finish — everything feels considered. My KamiraFit linen pieces have essentially replaced half my spring wardrobe.",
    rating: 5,
    order: 0,
    isActive: true,
  },
  {
    name: "Marcus Lee",
    id: "marcus",
    location: "London, UK",
    quote:
      "Finally, a label that nails the fundamentals without compromise. The crop hoodie set is the softest textile I own.",
    rating: 5,
    order: 1,
    isActive: true,
  },
  {
    id: "sofia",
    name: "Sofia Álvarez",
    location: "Lisbon, PT",
    quote:
      "Quiet luxury at an honest valuation. The delicate seam stitching on the liquid slip dress proves exceptional atelier discipline.",
    rating: 5,
    order: 2,
    isActive: true,
  },
];

function getInitials(name: string): string {
  if (!name) return "KF";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1 text-surface-tint" aria-label={`${rating} out of 5 stars`}>
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
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { data: serverTestimonials } = useTestimonials();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const items = (
    serverTestimonials && serverTestimonials.length > 0
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
    <section id="manifesto" className="w-full bg-surface pt-8 pb-10 sm:pb-12">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Velvet Texture Full-Width Campaign Banner from Stitch */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-primary-container text-white py-8 sm:py-10 px-6 sm:px-12 text-center shadow-xl mb-8 sm:mb-10">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-soft-light scale-105 pointer-events-none"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80')",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-primary-container/85 via-primary-container/50 to-primary/95 pointer-events-none"
          />
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <span className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[9.5px] uppercase font-bold tracking-[0.25em] text-primary-fixed mb-3 border border-white/20">
              The Craft of Living
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-light leading-tight tracking-tight">
              Thoughtfully woven fabrics.
              <br />
              <span className="italic text-primary-fixed-dim">
                Engineered for timeless everyday grace.
              </span>
            </h2>
            <p className="mt-3 font-sans text-xs sm:text-sm text-white/80 font-light max-w-xl leading-relaxed">
              We reject transient micro-trends in favor of enduring silhouettes, breathable organic
              fibers, and fair artisan craftsmanship.
            </p>
          </div>
        </div>

        {/* Devotee Chronicles Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <span className="text-surface-tint text-xs uppercase tracking-[0.25em] font-semibold block mb-1">
              Devotee Chronicles
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-primary font-normal">
              What our patrons cherish.
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              aria-label="Previous review"
              className="w-11 h-11 rounded-full border border-outline-variant/60 hover:border-primary flex items-center justify-center text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              aria-label="Next review"
              className="w-11 h-11 rounded-full bg-primary-container text-white flex items-center justify-center hover:bg-primary transition-colors shadow disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* Luxury Quote Cards Carousel */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-6 overflow-x-auto scroll-smooth pb-6 pt-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          role="region"
          aria-label="Customer testimonials carousel"
        >
          {items.map((t, index) => {
            const avatarBg =
              index % 3 === 0
                ? "bg-secondary-fixed text-primary"
                : index % 3 === 1
                ? "bg-primary-fixed text-primary"
                : "bg-secondary-container text-primary";

            return (
              <figure
                key={t.id}
                className="relative flex w-[260px] sm:w-[300px] h-[240px] sm:h-[260px] shrink-0 snap-start flex-col justify-between rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 p-5 sm:p-6 transition-colors hover:border-primary/40 shadow-sm"
              >
                <div className="overflow-hidden">
                  <span
                    aria-hidden
                    className="font-serif text-3xl text-surface-tint/40 leading-none select-none block mb-1.5"
                  >
                    “
                  </span>
                  <blockquote className="font-serif text-xs sm:text-sm text-primary italic leading-relaxed line-clamp-4">
                    {t.quote}
                  </blockquote>
                </div>

                <figcaption className="mt-3.5 pt-3 border-t border-outline-variant/30 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${avatarBg}`}
                    >
                      {getInitials(t.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans text-xs font-bold text-primary truncate">
                        {t.name}
                      </h4>
                      <span className="text-[9.5px] uppercase font-sans tracking-wider text-outline block truncate">
                        {t.location}
                      </span>
                    </div>
                  </div>
                  <StarRating rating={t.rating ?? 5} />
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
