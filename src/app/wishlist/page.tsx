import type { Metadata } from "next";
import WishlistPageClient from "@/features/product/components/WishlistPageClient";
import PageShell from "@/components/layout/PageShell";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Wishlist — KamiraFit",
  description: "Your saved KamiraFit pieces, ready whenever you are.",
};

export default function WishlistPage() {
  return (
    <PageShell>
      <Section padding="md">
        <WishlistPageClient />
      </Section>
    </PageShell>
  );
}
