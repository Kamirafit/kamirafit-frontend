import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CartPageClient from "@/features/cart/components/CartPageClient";

export const metadata: Metadata = {
  title: "Cart — KamiraFit",
  description: "Review the items in your KamiraFit shopping bag.",
};

export default function CartPage() {
  return (
    <PageShell>
      <CartPageClient />
    </PageShell>
  );
}
