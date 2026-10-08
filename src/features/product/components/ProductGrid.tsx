import type { Product } from "../types";
import ProductCard from "./ProductCard";
import EmptyState from "@/components/states/EmptyState";

type Props = {
  products: Product[];
};

export default function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return <EmptyState title="No products found" description="Try widening the price range or clearing a filter." />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 lg:gap-x-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
