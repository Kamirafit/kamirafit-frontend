import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard, { type Product } from "./ProductCard";

const PRODUCTS: Product[] = [
  {
    id: "ivory-oversized-tee",
    name: "Ivory Oversized Tee",
    price: 1299,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    tag: "New",
  },
  {
    id: "midnight-hoodie",
    name: "Midnight Relaxed Hoodie",
    price: 2499,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "stone-crewneck",
    name: "Stone Everyday Crewneck",
    price: 1799,
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
    tag: "Bestseller",
  },
  {
    id: "sand-regular-tee",
    name: "Sand Regular Fit Tee",
    price: 999,
    image:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80",
  },
];

export default function FeaturedProducts() {
  return (
    <Section id="shop">
      <SectionHeader
        eyebrow="Featured"
        title="This Week's Edit"
        action={
          <a
            href="/shop"
            className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gold transition-colors hover:text-gold-bright"
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

      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-8 lg:mt-16 lg:grid-cols-4">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
