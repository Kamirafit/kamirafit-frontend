import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KamiraFit — Elevate Your Everyday Style",
  description:
    "Premium comfort. Effortless fashion. Discover KamiraFit's latest collection of oversized tees, regular fit essentials, and hoodies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-neutral-900`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
