import type { Product } from "../types";
import ProductCard from "./ProductCard";
import EmptyState from "@/components/states/EmptyState";

type Props = {
  products: Product[];
  onResetFilters?: () => void;
};

export default function ProductGrid({ products, onResetFilters }: Props) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No Garments Found"
        description="We couldn't find any garments matching your exact selections. Try broadening your filters or resetting them."
        action={
          onResetFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-6 py-2.5 rounded-full bg-primary-container text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary transition-all shadow-sm cursor-pointer"
            >
              Reset All Filters
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

