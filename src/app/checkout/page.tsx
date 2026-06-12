import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CheckoutPageClient from "@/features/cart/components/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout — KamiraFit",
  description: "Complete your KamiraFit order.",
};

export default function CheckoutPage() {
  return (
    <PageShell>
      <CheckoutPageClient />
    </PageShell>
  );
}
