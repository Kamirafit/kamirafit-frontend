import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import Newsletter from "@/components/home/Newsletter";
import Testimonials from "@/components/home/Testimonials";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PageShell from "@/components/layout/PageShell";

export default function Home() {
  return (
    <PageShell>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </PageShell>
  );
}
