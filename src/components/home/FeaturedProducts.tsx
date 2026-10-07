import Link from "next/link";
import ProductCard from "@/features/product/components/ProductCard";
import { Product } from "@/types/api";
import EmptyState from "@/components/states/EmptyState";
import ErrorState from "@/components/states/ErrorState";

export default function FeaturedProducts({
  products = [],
  isError = false,
}: {
  products?: Product[];
  isError?: boolean;
}) {
  const displayCount = products.length > 0 ? (products.length < 10 ? `0${products.length}` : String(products.length)) : "00";

  return (
    <section
      id="featured-edit"
      className="w-full bg-surface-container-low/70 py-8 sm:py-10 lg:py-12 border-y border-outline-variant/30"
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Curated Counter & Action */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3 text-surface-tint text-xs uppercase tracking-[0.2em] font-semibold mb-2">
              <span className="w-8 h-px bg-surface-tint" />
              Curator’s Selection
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-primary font-normal tracking-tight">
              This Week&apos;s Edit
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="font-sans text-xs uppercase tracking-widest text-outline">
              Showing {displayCount} Curated Styles
            </span>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary hover:text-surface-tint transition-colors group"
            >
              <span>View Whole Drop</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {isError ? (
          <div className="mt-8">
            <ErrorState
              title="Featured Collection Unavailable"
              message="We couldn't load this week's featured edit right now. Browse our full shop or check back shortly."
              retryLabel="Browse Full Shop"
              actionHref="/shop"
            />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No featured products"
              description="Our next edit is being prepared. Browse the full shop in the meantime."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
