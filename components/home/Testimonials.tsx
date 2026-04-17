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

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-12">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.id}
            className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-sm"
          >
            <blockquote className="text-base leading-relaxed text-neutral-800">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-8">
              <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
              <p className="text-xs text-neutral-500">{t.location}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
