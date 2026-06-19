import Container from "@/components/ui/Container";
import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton";

export default function ShopLoading() {
  return <Container className="py-16" aria-label="Loading products"><ProductGridSkeleton /></Container>;
}
