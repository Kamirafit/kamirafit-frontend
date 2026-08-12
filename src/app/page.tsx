import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import Newsletter from "@/components/home/Newsletter";
import Testimonials from "@/components/home/Testimonials";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PageShell from "@/components/layout/PageShell";

import { productService } from "@/services/product";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // ISR - Revalidate every hour

export default async function Home() {
  const products = await productService.getFeaturedProducts().catch(() => []);

  return (
    <PageShell>
      <Hero />
      <FeaturedProducts products={products} />
      <Categories />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </PageShell>
  );
}
