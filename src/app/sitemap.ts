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
    // Top Fashion & Apparel Category Hubs
    {
      url: `${baseUrl}/shop?category=Kurti`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop?category=Co-ords+Sets`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop?category=Dresses`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop?category=T-Shirts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop?category=Oversized+T-Shirts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop?category=Hoodies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Customer Support & Policies
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
      .filter((p) => p && (p.slug || p.id) && p.isActive !== false && (!isProd || !p.id.startsWith("p-0")))
      .map((product) => {
        const identifier = product.slug || product.id;
        const lastModDate = product.updatedAt || product.createdAt || new Date().toISOString();
        const imgs = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean);
        return {
          url: `${baseUrl}/product/${identifier}`,
          lastModified: new Date(lastModDate),
          changeFrequency: "weekly" as const,
          priority: 0.8,
          images: imgs.length > 0 ? imgs : undefined,
        };
      });
  } catch {
    productPages = [];
  }

  return [...staticPages, ...productPages];
}
