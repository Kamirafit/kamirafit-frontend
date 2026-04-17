import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import Container from "@/components/ui/Container";
import ProductDetailsClient from "@/features/product/components/ProductDetailsClient";
import ProductReviews from "@/features/product/components/ProductReviews";
import RelatedProducts from "@/features/product/components/RelatedProducts";
import {
  PRODUCTS,
  getProductById,
  getRelatedProducts,
} from "@/features/product/data/products";

type PageParams = { id: string };

export function generateStaticParams(): PageParams[] {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) {
    return { title: "Product not found — KamiraFit" };
  }
  return {
    title: `${product.name} — KamiraFit`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const related = getRelatedProducts(product.id, 4);

  return (
    <PageShell>
      <Container className="py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-neutral-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-neutral-900"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/shop"
                className="transition-colors hover:text-neutral-900"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-neutral-900">{product.name}</li>
          </ol>
        </nav>

        <ProductDetailsClient product={product} />

        <div className="mt-16 grid grid-cols-1 gap-16">
          <section
            aria-labelledby="description-heading"
            className="flex flex-col gap-4"
          >
            <h2
              id="description-heading"
              className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl"
            >
              Product description
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-neutral-700">
              {product.description}
            </p>
            <ul className="mt-2 grid max-w-xl grid-cols-1 gap-2 text-sm text-neutral-700 sm:grid-cols-2">
              <li>· Premium combed cotton blend</li>
              <li>· Reinforced shoulder seams</li>
              <li>· Pre-washed for minimal shrinkage</li>
              <li>· Machine washable</li>
            </ul>
          </section>

          <ProductReviews
            reviews={product.reviews}
            averageRating={product.rating}
          />

          <RelatedProducts products={related} />
        </div>
      </Container>
    </PageShell>
  );
}
