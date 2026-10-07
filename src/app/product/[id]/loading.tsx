import ProductDetailsSkeleton from "@/components/skeleton/ProductDetailsSkeleton";

export default function ProductLoading() {
  return (
    <div
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10"
      aria-label="Loading product details"
    >
      <ProductDetailsSkeleton />
    </div>
  );
}
