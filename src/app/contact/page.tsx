import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ContactClient from "./ContactClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

export const metadata: Metadata = {
  title: "Contact KamiraFit | Customer Care, Support & Boutique Inquiries",
  description:
    "Get in touch with the KamiraFit concierge team. Connect for sizing consultations, order tracking, styling advice, or wholesale partnerships in Kolkata & pan-India.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact KamiraFit | Customer Care & Styling Support",
    description:
      "Reach our Kolkata headquarters and customer support team for all apparel and order inquiries. Mon–Sat 10:00 AM – 7:00 PM IST.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
};

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact KamiraFit",
    description: "Official customer contact page for KamiraFit apparel and designer clothing.",
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: "KamiraFit",
      legalName: "KAMIRAFIT CREATION PVT LTD",
      telephone: "+91-9830000000",
      email: "support@kamirafit.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "9, Bijoy Basu Road, Bhawanipore",
        addressLocality: "Kolkata",
        addressRegion: "West Bengal",
        postalCode: "700025",
        addressCountry: "IN",
      },
    },
  };

  const safeSchema = JSON.stringify(contactSchema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSchema }}
      />
      <ContactClient />
    </PageShell>
  );
}
