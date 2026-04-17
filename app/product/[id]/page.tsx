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
      <Container className="py-10 lg:py-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-[11px] uppercase tracking-[0.22em] text-paper-muted"
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

        <ProductDetailsClient product={product} />

        <div className="mt-20 grid grid-cols-1 gap-20">
          <section
            aria-labelledby="description-heading"
            className="flex flex-col gap-4"
          >
            <h2
              id="description-heading"
              className="font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl"
            >
              Product description
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-paper-muted">
              {product.description}
            </p>
            <ul className="mt-2 grid max-w-xl grid-cols-1 gap-2 text-sm text-paper-muted sm:grid-cols-2">
              <li><span className="text-gold">·</span> Premium combed cotton blend</li>
              <li><span className="text-gold">·</span> Reinforced shoulder seams</li>
              <li><span className="text-gold">·</span> Pre-washed for minimal shrinkage</li>
              <li><span className="text-gold">·</span> Machine washable</li>
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
