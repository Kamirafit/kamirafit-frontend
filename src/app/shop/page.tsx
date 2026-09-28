import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ShopPageClient from "@/features/product/components/ShopPageClient";
import { productService } from "@/services/product";

export const revalidate = 60; // ISR - Revalidate shop listings every minute

type ShopSearchParams = {
  category?: string | string[];
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

const CATEGORY_SEO_TITLES: Record<string, { title: string; desc: string }> = {
  Kurti: {
    title: "Designer Kurtis & Ethnic Tops Online | Women's Clothing — KamiraFit",
    desc: "Shop handcrafted designer kurtis, embroidered tunics, and contemporary ethnic wear online at KamiraFit. Pure cotton, rayon & festive silks with fast delivery across India.",
  },
  "Co-ords Sets": {
    title: "Women's Co-ord Sets & Matching 2-Piece Outfits | KamiraFit Clothing",
    desc: "Discover chic two-piece and three-piece co-ord sets for women at KamiraFit. Breathable linens, resort prints, and tailored coords for every occasion.",
  },
  Dresses: {
    title: "Women's Dresses & Western Gowns Online | Buy Fashion Clothing — KamiraFit",
    desc: "Explore elegant slip dresses, A-line gowns, floral day dresses, and evening silhouettes at KamiraFit. Modern cuts crafted for effortless sophistication.",
  },
  "T-Shirts": {
    title: "Women's T-Shirts & Casual Tops | Premium Cotton Apparel — KamiraFit",
    desc: "Shop premium combed-cotton regular fit t-shirts, crew necks, and versatile daily apparel from KamiraFit with all-day comfort.",
  },
  "Oversized T-Shirts": {
    title: "Oversized Graphic T-Shirts for Women | Luxury Streetwear — KamiraFit",
    desc: "Elevate your streetwear collection with heavyweight oversized tees, drop-shoulder fits, and minimalist typography prints from KamiraFit.",
  },
  Hoodies: {
    title: "Premium Fleece Hoodies & Sweatshirts | Streetwear Apparel — KamiraFit",
    desc: "Cozy up in luxury fleece hoodies, relaxed fit pullovers, and contemporary winterwear from KamiraFit. Premium warmth with modern aesthetics.",
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
  const { category } = await searchParams;
  const activeCategory = Array.isArray(category) ? category[0] : category;
  const seo = resolveCategorySeo(activeCategory);

  if (seo) {
    const slugMap: Record<string, string> = {
      Kurti: "kurtis",
      "Co-ords Sets": "co-ord-sets",
      Dresses: "dresses",
      "T-Shirts": "t-shirts",
      "Oversized T-Shirts": "oversized-t-shirts",
      Hoodies: "hoodies",
    };
    const targetSlug = slugMap[seo.canonicalCategory];
    const canonicalPath = targetSlug
      ? `/category/${targetSlug}`
      : `/shop?category=${encodeURIComponent(activeCategory || seo.canonicalCategory)}`;

    return {
      title: seo.title,
      description: seo.desc,
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

  return {
    title: "Shop Women's Clothing, Kurtis, Co-ord Sets & Dresses Online | KamiraFit",
    description:
      "Browse the complete KamiraFit designer apparel catalog. Filter by category, size, color, and price. Free delivery on orders over ₹999 across India.",
    alternates: {
      canonical: "/shop",
    },
    openGraph: {
      title: "Shop Women's Clothing, Kurtis, Co-ord Sets & Dresses Online | KamiraFit",
      description:
        "Explore KamiraFit's curated fashion collection of designer kurtis, linen co-ords, evening dresses, and oversized streetwear.",
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

  const initialProducts = await productService.getProducts().catch(() => []);

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
      />
    </PageShell>
  );
}
