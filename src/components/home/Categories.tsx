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
  "unisex-collections": "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1000&q=80",
  unisex: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=1000&q=80",
  "indian-wear": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
  indian: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
  kurti: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
  "western-wear": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
  western: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
  "co-ords-sets": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
  dresses: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80",
  "t-shirts": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
  "oversized-t-shirts": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
  hoodies: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
};

function resolveCategoryFallbackImage(slug: string, name: string): string {
  if (DEFAULT_CATEGORY_IMAGES[slug]) return DEFAULT_CATEGORY_IMAGES[slug];
  const lower = `${slug} ${name}`.toLowerCase();
  if (lower.includes("indian") || lower.includes("kurti") || lower.includes("ethnic")) {
    return DEFAULT_CATEGORY_IMAGES["indian-wear"];
  }
  if (lower.includes("western") || lower.includes("dress") || lower.includes("coord")) {
    return DEFAULT_CATEGORY_IMAGES["western-wear"];
  }
  if (lower.includes("unisex") || lower.includes("tee") || lower.includes("hoodie") || lower.includes("street")) {
    return DEFAULT_CATEGORY_IMAGES["unisex-collections"];
  }
  return DEFAULT_CATEGORY_IMAGE;
}

export default async function Categories() {
  const rawCategories = await categoryService.getCategories();
  const categories: Category[] = (rawCategories || []).map(
    (category, i) => {
      const slug = category.slug || category.name.toLowerCase().replace(/[\s_]+/g, "-");
      const fallbackImage = resolveCategoryFallbackImage(slug, category.name);
      const image = getValidImageSrc(category.image, fallbackImage);

      const subList =
        Array.isArray(category.subcategories) && category.subcategories.length > 0
          ? category.subcategories
              .map((s) => (typeof s === "string" ? s : s.name || s.title || ""))
              .filter(Boolean)
          : [];

      const subPreview =
        subList.length > 0
          ? subList.join(", ")
          : PARENT_CATEGORY[slug] ?? category.name;

      return {
        id: category.id || slug,
        title: category.name,
        description: category.description ?? "Silhouettes constructed with micro-calibrated draping and effortless everyday comfort.",
        subcategoryPreview: subPreview,
        subcategories: subList,
        href: `/shop?category=${slug}`,
        image,
        index: i + 1 < 10 ? `0${i + 1}` : String(i + 1),
      };
    },
  );

  return (
    <section
      id="portals"
      className="w-full bg-surface-container-low py-8 sm:py-10 lg:py-12 border-t border-outline-variant/30"
    >
      <div id="categories" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3 text-surface-tint text-xs uppercase tracking-[0.25em] font-semibold mb-2">
              <span className="w-8 h-px bg-surface-tint" />
              Atelier Horizons
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-primary font-normal tracking-tight">
              Explore Signature Realms
            </h2>
          </div>
          <p className="font-sans text-xs uppercase tracking-widest text-outline">
            Three defined worlds • One coherent design ethos
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No categories available"
              description="The collection is being organized. Please check back shortly."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((category, idx) => (
              <CategoryCard key={category.id} category={category} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
