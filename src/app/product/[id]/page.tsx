import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import Container from "@/components/ui/Container";
import ProductDetails from "@/features/product/components/ProductDetails";
import ProductReviews from "@/features/product/components/ProductReviews";
import RelatedProducts from "@/features/product/components/RelatedProducts";
import { productService } from "@/services/product";

type PageParams = { id: string };

export const dynamic = "force-dynamic";
export const revalidate = 3600; // ISR - Revalidate detail pages every hour

export async function generateStaticParams(): Promise<PageParams[]> {
  try {
    const products = await productService.getProducts();
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }
    // Filter out mock IDs in production
    const isProd = process.env.NODE_ENV === "production";
    const validProducts = isProd ? products.filter((p) => !p.id.startsWith("p-0")) : products;
    return validProducts.map((p) => ({ id: p.id }));
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

    return {
      title: `${product.name} — KamiraFit`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: `${product.name} — KamiraFit`,
        description: product.description.slice(0, 160),
        url: `${siteUrl}/product/${product.id}`,
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
        title: `${product.name} — KamiraFit`,
        description: product.description.slice(0, 160),
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Product Not Found — KamiraFit",
      description: "The requested product is unavailable or does not exist.",
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;
  let product;
  try {
    product = await productService.getProduct(id);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const related = await productService.getRelatedProducts(product.id, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

  // Product JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      "@type": "Brand",
      name: "KamiraFit",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.id}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
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

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
