import type { MetadataRoute } from "next";
import { productService } from "@/services/product";
import { categoryService } from "@/services/category";

export const revalidate = 3600; // ISR - Revalidate sitemap hourly to pick up catalog updates

const SITEMAP_MAX_URLS = 5000;
const BATCH_SIZE = 100;

const FALLBACK_CATEGORY_SLUGS = [
  "kurtis",
  "co-ord-sets",
  "dresses",
  "t-shirts",
  "oversized-t-shirts",
  "hoodies",
];

export async function generateSitemaps(): Promise<{ id: number }[]> {
  try {
    const { total } = await productService.getProductsPage({ page: 1, limit: 1 });
    const sitemapsCount = Math.max(1, Math.ceil(total / SITEMAP_MAX_URLS));
    return Array.from({ length: sitemapsCount }, (_, i) => ({ id: i }));
  } catch (err) {
    console.warn("Failed to generate dynamic sitemap indices, defaulting to index 0:", err);
    return [{ id: 0 }];
  }
}

export default async function sitemap(
  props?: { id?: string | number } | Promise<{ id?: string | number }>
): Promise<MetadataRoute.Sitemap> {
  const resolvedProps = props ? await Promise.resolve(props) : undefined;
  const sitemapId = Number(resolvedProps?.id ?? 0);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

  // Base static and category pages are only emitted in the primary sitemap (id = 0)
  const staticPages: MetadataRoute.Sitemap = sitemapId === 0 ? [
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
  ] : [];

  // Dynamic Category Pages from Backend (only in primary sitemap id = 0)
  let categoryPages: MetadataRoute.Sitemap = [];
  if (sitemapId === 0) {
    try {
      const categories = await categoryService.getCategories();
      const slugSet = new Set<string>();

      if (Array.isArray(categories) && categories.length > 0) {
        for (const cat of categories) {
          const primarySlug = (cat.slug || cat.name || "")
            .toLowerCase()
            .trim()
            .replace(/[\s_]+/g, "-");
          if (primarySlug) {
            slugSet.add(primarySlug);
          }
          if (Array.isArray(cat.subcategories)) {
            for (const sub of cat.subcategories) {
              const subName = typeof sub === "string" ? sub : sub?.slug || sub?.name || "";
              const subSlug = subName.toLowerCase().trim().replace(/[\s_]+/g, "-");
              if (subSlug) {
                slugSet.add(subSlug);
              }
            }
          }
        }
      }

      // Ensure core high-value taxonomy hubs are always present if backend returned empty
      if (slugSet.size === 0) {
        for (const fallback of FALLBACK_CATEGORY_SLUGS) {
          slugSet.add(fallback);
        }
      }

      categoryPages = Array.from(slugSet).map((slug) => ({
        url: `${baseUrl}/category/${encodeURIComponent(slug)}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85,
      }));
    } catch (err) {
      console.warn("Sitemap: API unreachable during category fetch; using fallback categories:", err);
      categoryPages = FALLBACK_CATEGORY_SLUGS.map((slug) => ({
        url: `${baseUrl}/category/${slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.85,
      }));
    }
  }

  // Dynamic Product Pages from Backend - Paged in 100-item batches to bound memory
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const startPage = Math.floor((sitemapId * SITEMAP_MAX_URLS) / BATCH_SIZE) + 1;
    const endPage = Math.ceil(((sitemapId + 1) * SITEMAP_MAX_URLS) / BATCH_SIZE);
    let currentPage = startPage;

    while (currentPage <= endPage) {
      const pageResult = await productService.getProductsPage({
        page: currentPage,
        limit: BATCH_SIZE,
      });

      if (!pageResult.products || pageResult.products.length === 0) {
        break;
      }

      for (const product of pageResult.products) {
        if (!product || (!product.slug && !product.id) || product.isActive === false) {
          continue;
        }
        const identifier = product.slug || product.id;
        const lastModDate = product.updatedAt || product.createdAt || new Date().toISOString();
        const imgs = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean);
        productPages.push({
          url: `${baseUrl}/product/${identifier}`,
          lastModified: new Date(lastModDate),
          changeFrequency: "weekly" as const,
          priority: 0.8,
          images: imgs.length > 0 ? imgs : undefined,
        });
      }

      if (currentPage >= pageResult.pages) {
        break;
      }
      currentPage += 1;
    }
  } catch (err) {
    console.warn(`Sitemap: API unreachable during product fetch for slice ${sitemapId}:`, err);
    productPages = [];
  }

  if (sitemapId === 0) {
    return [...staticPages, ...categoryPages, ...productPages];
  }

  return productPages;
}
