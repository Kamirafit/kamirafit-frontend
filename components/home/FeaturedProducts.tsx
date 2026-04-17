import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard, { type Product } from "./ProductCard";

const PRODUCTS: Product[] = [
  {
    id: "ivory-oversized-tee",
    name: "Ivory Oversized Tee",
    price: 42,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    tag: "New",
  },
  {
    id: "midnight-hoodie",
    name: "Midnight Relaxed Hoodie",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "stone-crewneck",
    name: "Stone Everyday Crewneck",
    price: 68,
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
    tag: "Bestseller",
  },
  {
    id: "sand-regular-tee",
    name: "Sand Regular Fit Tee",
    price: 36,
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
            className="text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
          >
            View all products →
          </a>
        }
      />

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:mt-12 lg:grid-cols-4">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
