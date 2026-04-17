import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";

type Testimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "ava",
    name: "Ava Thompson",
    location: "Brooklyn, NY",
    quote:
      "The fit, the fabric, the finish — everything feels considered. My KamiraFit tees have replaced half my wardrobe.",
  },
  {
    id: "marcus",
    name: "Marcus Lee",
    location: "London, UK",
    quote:
      "Finally, a brand that nails the basics. The hoodie is the softest thing I own and the cut is effortlessly modern.",
  },
  {
    id: "sofia",
    name: "Sofia Álvarez",
    location: "Lisbon, PT",
    quote:
      "Quiet luxury at an honest price. I appreciate the attention to detail and the ethical supply chain.",
  },
];

export default function Testimonials() {
  return (
    <Section tone="muted">
      <SectionHeader
        eyebrow="Loved by"
        title="What our customers are saying."
      />

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-16 lg:gap-8">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.id}
            className="relative flex h-full flex-col justify-between rounded-2xl border border-line bg-ink p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_30px_60px_-30px_rgba(212,175,55,0.2)]"
          >
            <span
              aria-hidden
              className="absolute left-6 top-5 font-display text-5xl leading-none text-gold/40"
            >
              “
            </span>
            <blockquote className="relative z-10 pt-8 text-base leading-relaxed text-paper">
              {t.quote}
            </blockquote>
            <figcaption className="mt-8 border-t border-line pt-5">
              <p className="font-display text-sm font-semibold text-paper">
                {t.name}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-paper-muted">
                {t.location}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
