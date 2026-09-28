import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import Container from "@/components/ui/Container";
import ProductDetails from "@/features/product/components/ProductDetails";
import ProductReviews from "@/features/product/components/ProductReviews";
import RelatedProducts from "@/features/product/components/RelatedProducts";
import ErrorState from "@/components/states/ErrorState";
import { productService } from "@/services/product";
import type { Product } from "@/types/entities";

type PageParams = { id: string };

export const revalidate = 60; // ISR - Revalidate detail pages every 60s

export async function generateStaticParams(): Promise<PageParams[]> {
  try {
    const paramsMap = new Map<string, PageParams>();
    for await (const batch of productService.crawlAllProducts(100)) {
      for (const p of batch) {
        if (!p || p.isActive === false) continue;
        if (p.slug) paramsMap.set(p.slug, { id: p.slug });
        if (p.id) paramsMap.set(p.id, { id: p.id });
      }
    }
    return Array.from(paramsMap.values());
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await productService.getProduct(id);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";
    const imageUrl = product.images?.[0] || `${siteUrl}/images/og-default.jpg`;
    const canonicalId = product.slug || product.id;

    // Google SERP Title optimization (strict <= 60 chars)
    const titleCandidate = `${product.name} — ₹${product.price} | KamiraFit`;
    const seoTitle =
      titleCandidate.length <= 60
        ? titleCandidate
        : `${product.name.slice(0, 45).trim()}… | KamiraFit`;

    // Google SERP Description optimization (strict <= 155 chars)
    const rawSnippet = (product.description || "").replace(/\s+/g, " ").trim();
    const snippet = rawSnippet || `Handcrafted ${product.category || "apparel"} with tailored silhouette.`;
    const descCandidate = `Buy ${product.name} online at ₹${product.price}. ${snippet}`;
    const seoDesc =
      descCandidate.length <= 152
        ? descCandidate
        : `${descCandidate.slice(0, 151).trim()}…`;

    return {
      title: { absolute: seoTitle },
      description: seoDesc,
      alternates: {
        canonical: `${siteUrl}/product/${canonicalId}`,
      },
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        url: `${siteUrl}/product/${canonicalId}`,
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDesc,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: { absolute: "Product Not Found | KamiraFit" },
      description: "The requested apparel item is unavailable or does not exist.",
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;
  let product: Product | null = null;
  let isApiError = false;

  try {
    product = await productService.getProduct(id);
  } catch (err: unknown) {
    const errorObj = err as { status?: number; response?: { status?: number } };
    const status = errorObj?.status || errorObj?.response?.status;
    if (status === 404) {
      notFound();
    }
    isApiError = true;
  }

  if (isApiError || !product) {
    if (!product && !isApiError) {
      notFound();
    }
    return (
      <PageShell mainClassName="bg-ink flex items-center justify-center min-h-[calc(100vh-14rem)] py-12 px-4">
        <ErrorState
          title="Product Unavailable"
          message="We couldn't load this product right now because our servers are momentarily unreachable. Please try again shortly."
          retryLabel="Explore Shop"
          onRetry={() => {
            if (typeof window !== "undefined") window.location.href = "/shop";
          }}
        />
      </PageShell>
    );
  }

  const related = await productService.getRelatedProducts(product.id, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";
  const canonicalId = product.slug || product.id;

  const hasStock = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants.some((v) => ((v.stock ?? 0) > 0 || (v.inventory?.available ?? 0) > 0) && v.isAvailable !== false)
    : (product.isAvailable !== false);
  const availability = hasStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  const primarySku = product.variants?.[0]?.sku || `KF-${product.id}`;

  // Complete Google Merchant & Product Rich Snippet Schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: primarySku,
    mpn: primarySku,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "KamiraFit",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${canonicalId}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "KamiraFit",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.price >= 999 ? 0 : 99,
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "d",
          },
        },
      },
    },
    ...(product.reviews?.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating || 5,
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  };

  // Google Search Breadcrumbs Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
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
        name: product.category || "Apparel",
        item: `${siteUrl}/shop?category=${encodeURIComponent(product.category || "all")}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${siteUrl}/product/${canonicalId}`,
      },
    ],
  };

  const safeProductJsonLd = JSON.stringify(productJsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  const safeBreadcrumbJsonLd = JSON.stringify(breadcrumbJsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeProductJsonLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeBreadcrumbJsonLd }}
      />
      <Container className="py-8 lg:py-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 text-[11px] uppercase tracking-[0.22em] text-paper-muted"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-gold">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-line-strong">
              /
            </li>
            <li>
              <Link href="/shop" className="transition-colors hover:text-gold">
                Shop
              </Link>
            </li>
            <li aria-hidden="true" className="text-line-strong">
              /
            </li>
            <li className="text-gold">{product.name}</li>
          </ol>
        </nav>

        <ProductDetails product={product} />

        <div className="mt-16 grid grid-cols-1 gap-16 lg:mt-20 lg:gap-20">
          <ProductReviews
            productId={product.id}
            reviews={product.reviews}
            averageRating={product.rating}
          />

          <RelatedProducts products={related} />
        </div>
      </Container>
    </PageShell>
  );
}
