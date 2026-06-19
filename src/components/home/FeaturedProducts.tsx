import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard from "@/features/product/components/ProductCard";

import { Product } from "@/types/api";
import EmptyState from "@/components/states/EmptyState";

export default function FeaturedProducts({ products = [] }: { products?: Product[] }) {
  return (
    <Section id="shop">
      <SectionHeader
        eyebrow="Featured"
        title="This Week's Edit"
        action={
          <a
            href="/shop"
            className="group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold transition-colors duration-300 hover:text-gold-bright"
          >
            View all
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        }
      />

      {products.length === 0 ? <div className="mt-12"><EmptyState title="No featured products" description="Our next edit is being prepared. Browse the full shop in the meantime." /></div> : <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:mt-16 lg:grid-cols-4 lg:gap-x-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>}
    </Section>
  );
}
