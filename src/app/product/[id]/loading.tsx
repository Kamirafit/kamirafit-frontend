import Container from "@/components/ui/Container";
import ProductDetailsSkeleton from "@/components/skeleton/ProductDetailsSkeleton";

export default function ProductLoading() {
  return <Container className="py-10" aria-label="Loading product details"><ProductDetailsSkeleton /></Container>;
}
