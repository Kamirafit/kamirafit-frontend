import type { Metadata } from "next";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import CartPageClient from "@/features/cart/components/CartPageClient";

export const metadata: Metadata = {
  title: "Cart — KamiraFit",
  description: "Review the items in your KamiraFit shopping bag.",
};

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <CartPageClient />
      </main>
      <Footer />
    </div>
  );
}
