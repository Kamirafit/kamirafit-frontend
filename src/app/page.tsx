import type { Metadata } from "next";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PageShell from "@/components/layout/PageShell";
import { productService } from "@/services/product";

export const revalidate = 60; // ISR - Revalidate every 60 seconds

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

export const metadata: Metadata = {
  title: "KamiraFit® | Buy Women's Clothing Online India — Kurtis, Co-ords, Dresses & Apparel",
  description:
    "Shop premium Indian & Western apparel at KamiraFit. Discover handcrafted designer kurtis, linen co-ords, satin evening dresses, and luxury streetwear. Express pan-India delivery & complimentary shipping over ₹999.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KamiraFit® | Buy Women's Clothing Online India — Kurtis, Co-ords, Dresses & Apparel",
    description:
      "Explore contemporary Indian kurtis, co-ords sets, dresses, and luxury everyday clothing online at KamiraFit. Premium fabrics, tailored silhouettes, and fast doorstep delivery.",
    url: siteUrl,
    type: "website",
  },
};

export default async function Home() {
  const products = await productService.getFeaturedProducts().catch(() => []);

  // Google SERP Rich FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where can I buy designer kurtis and women's clothing online in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can buy exclusive handcrafted designer kurtis, matching co-ord sets, dresses, and streetwear apparel online directly from KamiraFit (kamirafit.com) with secure online checkout and pan-India express shipping.",
        },
      },
      {
        "@type": "Question",
        name: "What clothing categories are available at KamiraFit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "KamiraFit offers a versatile range of apparel including Designer Kurtis, 2-Piece & 3-Piece Co-ord Sets, Western & Indo-Western Dresses, Oversized Graphic T-Shirts, Premium Hoodies, and Luxury Everyday Streetwear.",
        },
      },
      {
        "@type": "Question",
        name: "What sizes are available in KamiraFit apparel?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "KamiraFit garments are tailored to flatter diverse body types, offering standard sizes from XS to 6XL alongside relaxed Free Size collections.",
        },
      },
      {
        "@type": "Question",
        name: "How fast is delivery for clothing orders across India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Orders are dispatched within 24–48 hours. Metro cities (Kolkata, Delhi NCR, Mumbai, Bengaluru, Hyderabad) receive deliveries within 2–4 business days, with all other pin codes serviced within 4–7 business days.",
        },
      },
      {
        "@type": "Question",
        name: "What is KamiraFit's return and exchange policy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "KamiraFit provides an easy 7-day return and exchange policy from the date of delivery. Garments must be unworn, unwashed, and returned in their original packaging with intact tags.",
        },
      },
    ],
  };

  const safeFaqSchema = JSON.stringify(faqSchema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeFaqSchema }}
      />
      <Hero />
      <FeaturedProducts products={products} />
      <Categories />
      <WhyChooseUs />
      <Testimonials />
    </PageShell>
  );
}
