import PageShell from "@/components/layout/PageShell";
import ShopPageClient from "@/features/product/components/ShopPageClient";

export const metadata = {
  title: "Shop - KamiraFit",
  description:
    "Browse the KamiraFit collection. Filter by category, size, color and price.",
};

type ShopSearchParams = {
  category?: string | string[];
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const { category } = await searchParams;
  const initialCategorySlug = Array.isArray(category) ? category[0] : category;

  return (
    <PageShell>
      <ShopPageClient initialCategorySlug={initialCategorySlug} />
    </PageShell>
  );
}
