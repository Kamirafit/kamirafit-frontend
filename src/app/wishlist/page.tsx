import type { Metadata } from "next";
import WishlistPageClient from "@/features/product/components/WishlistPageClient";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Curated Wishlist — KamiraFit",
  description: "Your saved KamiraFit pieces, gathered in one place. Move them to your shopping bag whenever you're ready.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function WishlistPage() {
  return (
    <PageShell>
      <WishlistPageClient />
    </PageShell>
  );
}
