import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import ShopPageClient from "@/features/product/components/ShopPageClient";
import { productService } from "@/services/product";
import type { Product } from "@/types/entities";

export const revalidate = 60; // ISR - Revalidate category listings every minute

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

export interface CategorySeoConfig {
  name: string;
  categoryFilter: string;
  title: string;
  desc: string;
  canonicalSlug: string;
}

export const CATEGORY_MAP: Record<string, CategorySeoConfig> = {
  kurtis: {
    name: "Designer Kurtis & Ethnic Tops",
    categoryFilter: "Kurti",
    title: "Designer Kurtis & Ethnic Tops | KamiraFit",
    desc: "Shop handcrafted designer kurtis and ethnic tops online at KamiraFit. Pure cotton, rayon & festive silks with fast delivery across India.",
    canonicalSlug: "kurtis",
  },
  kurti: {
    name: "Designer Kurtis & Ethnic Tops",
    categoryFilter: "Kurti",
    title: "Designer Kurtis & Ethnic Tops | KamiraFit",
    desc: "Shop handcrafted designer kurtis and ethnic tops online at KamiraFit. Pure cotton, rayon & festive silks with fast delivery across India.",
    canonicalSlug: "kurtis",
  },
  "co-ord-sets": {
    name: "Women's Co-ord Sets",
    categoryFilter: "Co-ords Sets",
    title: "Women's Co-ord Sets & Matching Outfits | KamiraFit",
    desc: "Discover chic 2-piece and 3-piece co-ord sets for women at KamiraFit. Breathable linens, resort prints, and tailored coords for every occasion.",
    canonicalSlug: "co-ord-sets",
  },
  "co-ords-sets": {
    name: "Women's Co-ord Sets",
    categoryFilter: "Co-ords Sets",
    title: "Women's Co-ord Sets & Matching Outfits | KamiraFit",
    desc: "Discover chic 2-piece and 3-piece co-ord sets for women at KamiraFit. Breathable linens, resort prints, and tailored coords for every occasion.",
    canonicalSlug: "co-ord-sets",
  },
  dresses: {
    name: "Women's Dresses & Western Gowns",
    categoryFilter: "Dresses",
    title: "Women's Dresses & Western Wear | KamiraFit",
    desc: "Explore slip dresses, gowns, floral day dresses, and evening styles at KamiraFit. Contemporary cuts crafted for effortless sophistication.",
    canonicalSlug: "dresses",
  },
  "western-wear": {
    name: "Western Wear & Dresses",
    categoryFilter: "Dresses",
    title: "Women's Dresses & Western Wear | KamiraFit",
    desc: "Explore slip dresses, gowns, floral day dresses, and evening styles at KamiraFit. Contemporary cuts crafted for effortless sophistication.",
    canonicalSlug: "western-wear",
  },
  "t-shirts": {
    name: "Women's T-Shirts & Tops",
    categoryFilter: "T-Shirts",
    title: "Women's T-Shirts & Casual Tops | KamiraFit",
    desc: "Shop premium combed-cotton regular fit t-shirts, crew necks, and versatile daily apparel from KamiraFit with all-day comfort.",
    canonicalSlug: "t-shirts",
  },
  "oversized-t-shirts": {
    name: "Oversized Graphic T-Shirts",
    categoryFilter: "Oversized T-Shirts",
    title: "Oversized Graphic T-Shirts for Women | KamiraFit",
    desc: "Elevate your streetwear with heavyweight oversized tees, drop-shoulder fits, and minimalist graphic prints from KamiraFit.",
    canonicalSlug: "oversized-t-shirts",
  },
  hoodies: {
    name: "Premium Fleece Hoodies & Sweatshirts",
    categoryFilter: "Hoodies",
    title: "Premium Fleece Hoodies & Sweatshirts | KamiraFit",
    desc: "Cozy up in luxury fleece hoodies, relaxed fit pullovers, and contemporary winterwear from KamiraFit with express India shipping.",
    canonicalSlug: "hoodies",
  },
};

export function resolveCategoryFromSlug(rawSlug: string): CategorySeoConfig | null {
  const normalized = rawSlug.trim().toLowerCase();
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }
  // Fallback to title-cased query if general category
  const readable = normalized
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const titleCandidate = `${readable} | Women's Fashion — KamiraFit`;
  const cleanTitle = titleCandidate.length <= 60 ? titleCandidate : `${readable} | KamiraFit`;

  return {
    name: readable,
    categoryFilter: readable,
    title: cleanTitle,
    desc: `Shop ${readable} from KamiraFit. Premium quality fabrics, contemporary silhouettes, and fast doorstep delivery across India.`,
    canonicalSlug: normalized,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = resolveCategoryFromSlug(slug);

  if (!config) {
    return {
      title: { absolute: "Collection Not Found | KamiraFit" },
    };
  }

  const canonicalUrl = `${siteUrl}/category/${config.canonicalSlug}`;

  return {
    title: { absolute: config.title },
    description: config.desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title,
      description: config.desc,
      url: canonicalUrl,
      type: "website",
      siteName: "KamiraFit",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.desc,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = resolveCategoryFromSlug(slug);

  if (!config) {
    notFound();
  }

  let initialProducts: Product[] = [];
  let initialError = false;
  try {
    initialProducts = await productService.getProducts();
  } catch (err) {
    console.error(`CategoryPage [${slug}]: Failed to fetch products from API:`, err);
    initialError = true;
    initialProducts = [];
  }

  // Filter products matching category for real schema items
  const matchedProducts = initialProducts.filter((p) => {
    const rawCat = String(p.category || "");
    const cat = rawCat.toLowerCase();
    const filter = config.categoryFilter.toLowerCase();
    return cat.includes(filter) || filter.includes(cat);
  });

  const categoryUrl = `${siteUrl}/category/${config.canonicalSlug}`;

  // CollectionPage & BreadcrumbList Schema for Google SERP
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${config.name} Collection`,
    description: config.desc,
    url: categoryUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "KamiraFit",
      url: siteUrl,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${siteUrl}/shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: config.name,
          item: categoryUrl,
        },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: matchedProducts.length,
      itemListElement: matchedProducts.slice(0, 24).map((p, idx) => {
        const inStock = p.variants && p.variants.length > 0 ? p.variants.some((v) => (v.stock ?? 0) > 0) : true;
        const price = Number(p.offerPrice || p.price || 0);
        const productUrl = `${siteUrl}/product/${p.slug || p.id}`;
        return {
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Product",
            name: p.title || p.name,
            url: productUrl,
            image: p.images?.[0] || p.image,
            offers: {
              "@type": "Offer",
              price: price > 0 ? price : 999,
              priceCurrency: "INR",
              availability: inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              url: productUrl,
            },
          },
        };
      }),
    },
  };

  const safeCollectionSchema = JSON.stringify(collectionSchema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeCollectionSchema }}
      />
      <ShopPageClient
        initialCategorySlug={config.categoryFilter}
        initialProducts={initialProducts}
        initialError={initialError}
      />
    </PageShell>
  );
}
