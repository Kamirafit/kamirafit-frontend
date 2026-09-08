import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PageShell from "@/components/layout/PageShell";

import { productService } from "@/services/product";

export const revalidate = 60; // ISR - Revalidate every 60 seconds

export default async function Home() {
  const products = await productService.getFeaturedProducts().catch(() => []);

  return (
    <PageShell>
      <Hero />
      <FeaturedProducts products={products} />
      <Categories />
      <WhyChooseUs />
      <Testimonials />
    </PageShell>
  );
}
