import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/layout/PageShell";
import OrderSuccessPage from "@/features/order/components/OrderSuccessPage";
import OrderSuccessSkeleton from "@/features/order/components/OrderSuccessSkeleton";

export const metadata: Metadata = {
  title: "Order Confirmation — KamiraFit",
  description: "Thank you for your order. View your order confirmation and details.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutSuccessPage() {
  return (
    <PageShell>
      <Suspense fallback={<OrderSuccessSkeleton />}>
        <OrderSuccessPage />
      </Suspense>
    </PageShell>
  );
}
