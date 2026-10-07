import Image from "next/image";
import Link from "next/link";
import { DEFAULT_CATEGORY_IMAGE, getValidImageSrc } from "@/lib/format";

export type Category = {
  id: string;
  title: string;
  image: string;
  description: string;
  href: string;
  subcategoryPreview?: string;
  subcategories?: string[];
  index?: string;
};

type Props = {
  category: Category;
  index?: number;
};

export default function CategoryCard({ category, index = 0 }: Props) {
  const imageSrc = getValidImageSrc(category.image, DEFAULT_CATEGORY_IMAGE);
  const formattedIndex = category.index || (index + 1 < 10 ? `0${index + 1}` : String(index + 1));
  const subcategoryPills = category.subcategories && category.subcategories.length > 0
    ? category.subcategories.slice(0, 3)
    : category.subcategoryPreview
    ? category.subcategoryPreview.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <Link
      href={category.href}
      className="group relative isolate rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[420px] p-5 sm:p-6 flex flex-col justify-between shadow-lg transition-all duration-700 hover:-translate-y-1.5 block cursor-pointer bg-primary"
    >
      {/* Background Image with Dynamic Zoom */}
      <Image
        src={imageSrc}
        alt={category.title}
        fill
        unoptimized={imageSrc.startsWith("data:") || imageSrc.startsWith("blob:")}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 z-0"
      />

      {/* High-Fashion Scrim Gradient */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-black/35 group-hover:via-primary/70 transition-colors z-[1]"
      />

      {/* Top Index */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-serif text-2xl font-light text-white/70">
          {formattedIndex}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-[0.2em] bg-white/15 text-white backdrop-blur-md border border-white/20">
          Atelier Realm
        </span>
      </div>

      {/* Bottom Content */}
      <div className="relative z-10">
        <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-white font-normal mb-1.5">
          {category.title}
        </h3>
        <p className="font-sans text-[11px] text-white/80 font-light mb-3.5 line-clamp-2 max-w-sm">
          {category.description}
        </p>

        {/* Subcategory Pills */}
        {subcategoryPills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {subcategoryPills.map((sub) => (
              <span
                key={sub}
                className="px-2 py-0.5 rounded-full text-[9px] uppercase font-semibold bg-white/15 text-white backdrop-blur-sm border border-white/10"
              >
                {sub}
              </span>
            ))}
          </div>
        )}

        {/* Tailored Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <span className="text-[11px] uppercase tracking-widest font-semibold text-white/90">
            Browse Styles
          </span>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-primary flex items-center justify-center group-hover:bg-primary-container group-hover:text-white transition-all shadow-md group-hover:rotate-45">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
