import CategoryCard, { type Category } from "./CategoryCard";

const CATEGORIES: Category[] = [
  {
    id: "oversized-tees",
    title: "Oversized Tees",
    description: "Relaxed silhouettes, heavyweight cotton.",
    image:
      "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "regular-fit",
    title: "Regular Fit",
    description: "Timeless essentials, tailored to move.",
    image:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "hoodies",
    title: "Hoodies",
    description: "Soft fleece, built for every season.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a9fbc86339e?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function Categories() {
  return (
    <section
      id="categories"
      className="border-y border-neutral-200 bg-neutral-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
            Shop by Category
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Built for the way you wear it.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
