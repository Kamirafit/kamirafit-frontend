import type { Product } from "../types";
import ProductCard from "./ProductCard";

type Props = {
  products: Product[];
};

export default function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <h2
          id="related-heading"
          className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl"
        >
          You may also like
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
