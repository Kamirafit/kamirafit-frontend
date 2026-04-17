import type { Metadata } from "next";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import CheckoutPageClient from "@/features/cart/components/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout — KamiraFit",
  description: "Complete your KamiraFit order.",
};

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <CheckoutPageClient />
      </main>
      <Footer />
    </div>
  );
}
