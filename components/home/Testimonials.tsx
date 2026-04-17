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
    <section className="border-y border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Loved by
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            What our customers are saying.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.id}
              className="flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-8 transition-shadow hover:shadow-sm"
            >
              <blockquote className="text-base leading-relaxed text-neutral-800">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-8">
                <p className="text-sm font-semibold text-neutral-900">
                  {t.name}
                </p>
                <p className="text-xs text-neutral-500">{t.location}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
