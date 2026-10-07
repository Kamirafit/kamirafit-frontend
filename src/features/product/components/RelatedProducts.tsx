import type { Product } from "../types";
import ProductCard from "./ProductCard";

type Props = {
  products: Product[];
};

export default function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="w-full bg-surface-container-low/60 py-12 sm:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl border border-outline-variant/20 my-6 sm:my-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold block">
            Products you may like
          </span>
          <h2
            id="related-heading"
            className="font-serif text-2xl sm:text-3xl text-primary font-medium mt-1"
          >
            You May Also Like
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
