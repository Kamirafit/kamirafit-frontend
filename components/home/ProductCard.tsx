import Image from "next/image";
import { buttonClasses } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  tag?: string;
};

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-gold/50 group-hover:shadow-[0_30px_60px_-30px_rgba(139,30,45,0.25)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        {product.tag ? (
          <span className="absolute left-3 top-3 rounded-full border border-gold/50 bg-ink/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold backdrop-blur">
            {product.tag}
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[15px] font-medium text-paper">
            {product.name}
          </h3>
          <p className="mt-1 font-display text-[15px] font-semibold tracking-wide text-gold">
            {formatPrice(product.price, { currency: "USD", locale: "en-US" })}
          </p>
        </div>
        <button
          type="button"
          className={`${buttonClasses("secondary", "sm")} shrink-0`}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
