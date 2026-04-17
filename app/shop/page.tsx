import PageShell from "@/components/layout/PageShell";
import ShopPageClient from "@/features/product/components/ShopPageClient";

export const metadata = {
  title: "Shop — KamiraFit",
  description:
    "Browse the KamiraFit collection. Filter by category, size, color and price.",
};

export default function ShopPage() {
  return (
    <PageShell>
      <ShopPageClient />
    </PageShell>
  );
}
