import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import CategoryCard, { type Category } from "./CategoryCard";

const CATEGORIES: Category[] = [
  {
    id: "kurti",
    title: "Kurti",
    description: "Indian silhouettes with everyday ease.",
    subcategoryPreview: "Indian",
    href: "/shop?category=kurti",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "co-ords-sets",
    title: "Co-ords Sets",
    description: "Matched sets for polished off-duty looks.",
    subcategoryPreview: "Indo-western",
    href: "/shop?category=co-ords-sets",
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "dresses",
    title: "Dresses",
    description: "Western staples for day-to-evening styling.",
    subcategoryPreview: "Western",
    href: "/shop?category=dresses",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "tshirts",
    title: "T-Shirts",
    description: "Clean unisex essentials in soft cotton.",
    subcategoryPreview: "Unisex T-Shirts",
    href: "/shop?category=tshirts",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "oversized-tshirts",
    title: "Oversized T-Shirts",
    description: "Relaxed silhouettes with a structured drape.",
    subcategoryPreview: "Unisex T-Shirts",
    href: "/shop?category=oversized-tshirts",
    image:
      "https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "hoodies",
    title: "Hoodies",
    description: "Soft fleece layers for cooler days.",
    subcategoryPreview: "Unisex T-Shirts",
    href: "/shop?category=hoodies",
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
        description="Thoughtfully designed silhouettes cut in premium fabrics, curated across Indian, Indo-western, Western, and unisex essentials."
      />

      <div className="mt-12 flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-16 lg:gap-8">
        {CATEGORIES.map((category) => (
          <div key={category.id} className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[22%]">
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </Section>
  );
}
