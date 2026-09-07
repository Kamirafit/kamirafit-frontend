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
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KamiraFit — Elevate Your Everyday Style",
    template: "%s | KamiraFit",
  },
  description:
    "Premium comfort. Effortless fashion. Discover KamiraFit's latest collection of oversized tees, regular fit essentials, and hoodies.",
  openGraph: {
    title: "KamiraFit — Elevate Your Everyday Style",
    description:
      "Premium comfort. Effortless fashion. Discover KamiraFit's latest collection of oversized tees, regular fit essentials, and hoodies.",
    url: siteUrl,
    siteName: "KamiraFit",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KamiraFit — Elevate Your Everyday Style",
    description: "Premium comfort. Effortless fashion. Discover KamiraFit's luxury streetwear essentials.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-ink text-paper`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
