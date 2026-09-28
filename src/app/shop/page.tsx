import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ShopPageClient from "@/features/product/components/ShopPageClient";
import { productService } from "@/services/product";
import type { Product } from "@/types/entities";

export const revalidate = 60; // ISR - Revalidate shop listings every minute

type ShopSearchParams = {
  category?: string | string[];
  sort?: string | string[];
  size?: string | string[];
  color?: string | string[];
  priceMin?: string | string[];
  priceMax?: string | string[];
  q?: string | string[];
  [key: string]: string | string[] | undefined;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

const CATEGORY_SEO_TITLES: Record<string, { title: string; desc: string }> = {
  Kurti: {
    title: "Designer Kurtis & Ethnic Tops | KamiraFit",
    desc: "Shop handcrafted designer kurtis and ethnic tops online at KamiraFit. Pure cotton, rayon & festive silks with fast delivery across India.",
  },
  "Co-ords Sets": {
    title: "Women's Co-ord Sets & Matching Outfits | KamiraFit",
    desc: "Discover chic 2-piece and 3-piece co-ord sets for women at KamiraFit. Breathable linens, resort prints, and tailored coords for every occasion.",
  },
  Dresses: {
    title: "Women's Dresses & Western Wear | KamiraFit",
    desc: "Explore slip dresses, gowns, floral day dresses, and evening styles at KamiraFit. Contemporary cuts crafted for effortless sophistication.",
  },
  "T-Shirts": {
    title: "Women's T-Shirts & Casual Tops | KamiraFit",
    desc: "Shop premium combed-cotton regular fit t-shirts, crew necks, and versatile daily apparel from KamiraFit with all-day comfort.",
  },
  "Oversized T-Shirts": {
    title: "Oversized Graphic T-Shirts for Women | KamiraFit",
    desc: "Elevate your streetwear with heavyweight oversized tees, drop-shoulder fits, and minimalist graphic prints from KamiraFit.",
  },
  Hoodies: {
    title: "Premium Fleece Hoodies & Sweatshirts | KamiraFit",
    desc: "Cozy up in luxury fleece hoodies, relaxed fit pullovers, and contemporary winterwear from KamiraFit with express India shipping.",
  },
};

function resolveCategorySeo(categoryParam?: string): { title: string; desc: string; canonicalCategory: string; name: string } | null {
  if (!categoryParam) return null;
  const raw = categoryParam.trim();
  const lower = raw.toLowerCase().replace(/[\s_]+/g, "-");

  if (lower === "dresses" || lower === "dress" || lower === "western-wear" || lower === "western") {
    return { ...CATEGORY_SEO_TITLES["Dresses"], canonicalCategory: "Dresses", name: "Dresses & Western Wear" };
  }
  if (lower === "kurti" || lower === "kurtis" || lower === "indian" || lower === "ethnic") {
    return { ...CATEGORY_SEO_TITLES["Kurti"], canonicalCategory: "Kurti", name: "Designer Kurtis" };
  }
  if (lower.includes("coord") || lower.includes("co-ord") || lower === "indo-western") {
    return { ...CATEGORY_SEO_TITLES["Co-ords Sets"], canonicalCategory: "Co-ords Sets", name: "Co-ords Sets" };
  }
  if (lower.includes("oversized")) {
    return { ...CATEGORY_SEO_TITLES["Oversized T-Shirts"], canonicalCategory: "Oversized T-Shirts", name: "Oversized T-Shirts" };
  }
  if (lower.includes("t-shirt") || lower.includes("tee")) {
    return { ...CATEGORY_SEO_TITLES["T-Shirts"], canonicalCategory: "T-Shirts", name: "T-Shirts" };
  }
  if (lower.includes("hoodie")) {
    return { ...CATEGORY_SEO_TITLES["Hoodies"], canonicalCategory: "Hoodies", name: "Hoodies" };
  }
  if (CATEGORY_SEO_TITLES[raw]) {
    return { ...CATEGORY_SEO_TITLES[raw], canonicalCategory: raw, name: raw };
  }
  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const { category, ...filters } = resolvedParams;
  const activeCategory = Array.isArray(category) ? category[0] : category;
  const seo = resolveCategorySeo(activeCategory);

  // Check if filtering/sorting query parameters are active
  const hasFilterParams = Object.keys(filters).some(
    (k) => filters[k] !== undefined && filters[k] !== ""
  );

  if (seo) {
    const slugMap: Record<string, string> = {
      Kurti: "kurtis",
      "Co-ords Sets": "co-ord-sets",
      Dresses: "dresses",
      "T-Shirts": "t-shirts",
      "Oversized T-Shirts": "oversized-t-shirts",
      Hoodies: "hoodies",
    };
    const targetSlug =
      slugMap[seo.canonicalCategory] ||
      activeCategory?.toLowerCase().trim().replace(/[\s_]+/g, "-") ||
      "kurtis";
    const canonicalPath = `/category/${encodeURIComponent(targetSlug)}`;

    return {
      title: seo.title,
      description: seo.desc,
      robots: hasFilterParams ? { index: false, follow: true } : undefined,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: seo.title,
        description: seo.desc,
        url: `${siteUrl}${canonicalPath}`,
        type: "website",
      },
    };
  }

  // Canonical for general /shop always points to clean /shop, never query-strings
  const defaultTitle = "Shop Women's Clothing & Designer Apparel | KamiraFit";
  const defaultDesc =
    "Browse KamiraFit's curated catalog of designer kurtis, co-ords, dresses, and streetwear. Free delivery on orders over ₹999 across India.";

  return {
    title: defaultTitle,
    description: defaultDesc,
    robots: (hasFilterParams || activeCategory) ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: "/shop",
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `${siteUrl}/shop`,
      type: "website",
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const { category } = await searchParams;
  const initialCategorySlug = Array.isArray(category) ? category[0] : category;

  let initialProducts: Product[] = [];
  let initialError = false;
  try {
    initialProducts = await productService.getProducts();
  } catch (err) {
    console.error("ShopPage: Failed to load products from API:", err);
    initialError = true;
    initialProducts = [];
  }

  const resolvedSeo = resolveCategorySeo(initialCategorySlug);

  // CollectionPage & BreadcrumbList Schema for Google SERP
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: resolvedSeo ? `${resolvedSeo.name} Collection` : "Women's Clothing & Designer Apparel",
    description: resolvedSeo ? resolvedSeo.desc : "Browse KamiraFit's complete online clothing catalog with express shipping across India.",
    url: initialCategorySlug ? `${siteUrl}/shop?category=${encodeURIComponent(initialCategorySlug)}` : `${siteUrl}/shop`,
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
        ...(initialCategorySlug
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: initialCategorySlug,
                item: `${siteUrl}/shop?category=${encodeURIComponent(initialCategorySlug)}`,
              },
            ]
          : []),
      ],
    },
  };

  const safeCollectionSchema = JSON.stringify(collectionSchema).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeCollectionSchema }}
      />
      <ShopPageClient
        initialCategorySlug={initialCategorySlug}
        initialProducts={initialProducts}
        initialError={initialError}
      />
    </PageShell>
  );
}
