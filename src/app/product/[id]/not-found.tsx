import PageShell from "@/components/layout/PageShell";
import Container from "@/components/ui/Container";
import EmptyState from "@/components/states/EmptyState";

export default function ProductNotFound() {
  return (
    <PageShell>
      <Container width="narrow" className="py-16 sm:py-24">
        <EmptyState title="Product not found" description="This product may have moved or is no longer available." />
      </Container>
    </PageShell>
  );
}
