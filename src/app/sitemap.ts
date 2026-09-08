import type { MetadataRoute } from "next";
import { productService } from "@/services/product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/size-guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await productService.getProducts();
    const isProd = process.env.NODE_ENV === "production";
    productPages = (products || [])
      .filter((p) => p && p.id && (!isProd || !p.id.startsWith("p-0")))
      .map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(product.createdAt || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    // If backend is unreachable during static build, return static pages
    productPages = [];
  }

  return [...staticPages, ...productPages];
}
