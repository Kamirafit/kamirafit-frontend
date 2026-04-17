import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
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
    <Section id="categories" tone="muted">
      <SectionHeader
        eyebrow="Shop by Category"
        title="Built for the way you wear it."
      />

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </Section>
  );
}
