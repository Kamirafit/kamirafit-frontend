import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import ShopPageClient from "@/features/product/components/ShopPageClient";

export const metadata = {
  title: "Shop — KamiraFit",
  description:
    "Browse the KamiraFit collection. Filter by category, size, color and price.",
};

export default function ShopPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <ShopPageClient />
      </main>
      <Footer />
    </div>
  );
}
