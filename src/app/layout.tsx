import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KamiraFit® | Buy Women's Clothing, Kurtis, Co-ord Sets & Dresses Online",
    template: "%s | KamiraFit Clothing & Apparel",
  },
  description:
    "Shop premium women's clothing & designer apparel at KamiraFit. Explore handcrafted kurtis, matching co-ord sets, chic dresses, oversized tees & luxury streetwear. Free shipping over ₹999 across India.",
  keywords: [
    "clothing online",
    "buy clothing online India",
    "women apparel online",
    "designer kurtis",
    "co ord sets for women",
    "western dresses online",
    "oversized t-shirts India",
    "hoodies and streetwear",
    "ethnic wear online",
    "Indo-western dresses",
    "KamiraFit clothing",
    "fashion apparel India",
    "luxury everyday wear",
    "apparel brand Kolkata",
    "cotton kurtas online",
    "party wear dresses",
  ],
  authors: [{ name: "KamiraFit Creation Pvt Ltd", url: siteUrl }],
  creator: "KamiraFit",
  publisher: "KamiraFit Creation Pvt Ltd",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KamiraFit® — Elevate Your Everyday Style | Designer Clothing & Apparel",
    description:
      "Shop handcrafted kurtis, luxury co-ord sets, elegant dresses & oversized streetwear. Premium quality fabrics, contemporary silhouettes & express delivery worldwide.",
    url: siteUrl,
    siteName: "KamiraFit",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KamiraFit® — Premium Clothing & Designer Apparel",
    description:
      "Discover the latest designer collection of kurtis, co-ords, dresses, and luxury streetwear essentials at KamiraFit.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "apparel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Structured Data: Organization & WebSite with Google Sitelinks Searchbox
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "KamiraFit",
    legalName: "KAMIRAFIT CREATION PVT LTD",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    description: "Premium Indian designer apparel brand specializing in contemporary kurtis, luxury co-ord sets, dresses, and elevated streetwear.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "9, Bijoy Basu Road, Bhawanipore",
      addressLocality: "Kolkata",
      addressRegion: "West Bengal",
      postalCode: "700025",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9830000000",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi", "Bengali"],
    },
    sameAs: [
      "https://www.instagram.com/kamirafit",
      "https://www.facebook.com/kamirafit",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "KamiraFit",
    description: "Online store for women's clothing, kurtis, co-ord sets, dresses, and apparel in India.",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const safeOrgSchema = JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  const safeWebSchema = JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-ink text-paper`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeOrgSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeWebSchema }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
