import Image from "next/image";
import { DEFAULT_PRODUCT_IMAGE, formatPrice, getValidImageSrc } from "@/lib/format";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  tag?: "New" | "Bestseller" | string;
};

type Props = {
  product: Product;
};

const BADGE_CLASS: Record<string, string> = {
  New: "bg-[#22C55E]",
  Bestseller: "bg-[#F97316]",
};

export default function ProductCard({ product }: Props) {
  const badgeBg = product.tag
    ? BADGE_CLASS[product.tag] ?? "bg-gold"
    : undefined;
  const imageSrc = getValidImageSrc(product.image, DEFAULT_PRODUCT_IMAGE);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:border-gold/50 group-hover:shadow-lg group-hover:shadow-[0_30px_60px_-30px_rgba(139,30,45,0.35)]">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        {product.tag ? (
          <span
            className={`absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-md ${badgeBg}`}
          >
            {product.tag}
          </span>
        ) : null}

        {/* Soft bottom gradient so the outline button reads on any image */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent"
        />

        {/* Add-to-Cart: wine outline at rest → wine fill + glow on hover */}
        <button
          type="button"
          className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full border-2 border-gold bg-white/90 px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur-md transition-all duration-300 ease-in-out hover:border-gold hover:bg-gold hover:text-white hover:shadow-[0_12px_30px_-10px_rgba(74,14,26,0.55)]"
        >
          Add to cart
        </button>
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <h3 className="truncate font-display text-[15px] font-medium text-paper">
          {product.name}
        </h3>
        <p className="shrink-0 font-display text-[15px] font-semibold tracking-wide text-gold">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
