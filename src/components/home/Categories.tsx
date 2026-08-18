import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { categoryService } from "@/services/category";
import CategoryCard, { type Category } from "./CategoryCard";
import EmptyState from "@/components/states/EmptyState";
import { DEFAULT_CATEGORY_IMAGE, getValidImageSrc } from "@/lib/format";

const PARENT_CATEGORY: Record<string, string> = {
  kurti: "Indian",
  "co-ords-sets": "Indo-western",
  dresses: "Western",
  "t-shirts": "Unisex T-Shirts",
  "oversized-t-shirts": "Unisex T-Shirts",
  hoodies: "Unisex T-Shirts",
};

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  kurti: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
  "co-ords-sets": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  dresses: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
  "t-shirts": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
  "oversized-t-shirts": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  hoodies: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
};

export default async function Categories() {
  const rawCategories = await categoryService.getCategories();
  const categories: Category[] = (rawCategories || []).map(
    (category) => {
      const slug = category.slug || category.name.toLowerCase().replace(/[\s_]+/g, "-");
      const fallbackImage =
        DEFAULT_CATEGORY_IMAGES[slug] ?? DEFAULT_CATEGORY_IMAGE;
      const image = getValidImageSrc(category.image, fallbackImage);

      const subPreview =
        Array.isArray(category.subcategories) && category.subcategories.length > 0
          ? category.subcategories
              .map((s) => (typeof s === "string" ? s : s.name || s.title || ""))
              .join(", ")
          : PARENT_CATEGORY[slug] ?? category.name;

      return {
        id: category.id || slug,
        title: category.name,
        description: category.description ?? "Explore the latest KamiraFit styles.",
        subcategoryPreview: subPreview,
        href: `/shop?category=${slug}`,
        image,
      };
    },
  );

  return (
    <Section id="categories" tone="muted">
      <SectionHeader
        eyebrow="Shop by Category"
        title="Built for the way you wear it."
        description="Thoughtfully designed silhouettes cut in premium fabrics, curated across Indian, Indo-western, Western, and unisex essentials."
      />

      {categories.length === 0 ? <div className="mt-12"><EmptyState title="No categories available" description="The collection is being organized. Please check back shortly." /></div> : <div className="mt-12 flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-16 lg:gap-8">
        {categories.map((category) => (
          <div key={category.id} className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[22%]">
            <CategoryCard category={category} />
          </div>
        ))}
      </div>}
    </Section>
  );
}
