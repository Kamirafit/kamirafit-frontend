import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { categoryService } from "@/services/category";
import CategoryCard, { type Category } from "./CategoryCard";

const PARENT_CATEGORY: Record<string, string> = {
  kurti: "Indian",
  "co-ords-sets": "Indo-western",
  dresses: "Western",
  "t-shirts": "Unisex T-Shirts",
  "oversized-t-shirts": "Unisex T-Shirts",
  hoodies: "Unisex T-Shirts",
};

export default async function Categories() {
  const categories: Category[] = (await categoryService.getCategories()).map(
    (category) => ({
      id: category.slug,
      title: category.name,
      description: category.description ?? "Explore the latest KamiraFit styles.",
      subcategoryPreview: PARENT_CATEGORY[category.slug] ?? category.name,
      href: `/shop?category=${category.slug}`,
      image: category.image ?? "",
    }),
  );

  return (
    <Section id="categories" tone="muted">
      <SectionHeader
        eyebrow="Shop by Category"
        title="Built for the way you wear it."
        description="Thoughtfully designed silhouettes cut in premium fabrics, curated across Indian, Indo-western, Western, and unisex essentials."
      />

      <div className="mt-12 flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-16 lg:gap-8">
        {categories.map((category) => (
          <div key={category.id} className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[22%]">
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </Section>
  );
}
