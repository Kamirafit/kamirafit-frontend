import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import CheckoutPageClient from "@/features/cart/components/CheckoutPageClient";
import OrderSuccessSkeleton from "@/features/order/components/OrderSuccessSkeleton";

export const metadata: Metadata = {
  title: "Checkout — KamiraFit",
  description: "Complete your KamiraFit order.",
};

export default function CheckoutPage() {
  return (
    <PageShell>
      <Suspense fallback={<OrderSuccessSkeleton />}>
        <CheckoutPageClient />
      </Suspense>
    </PageShell>
  );
}

