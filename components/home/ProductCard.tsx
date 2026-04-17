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
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {product.tag ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-900 shadow-sm">
            {product.tag}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-neutral-900">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {formatPrice(product.price, { currency: "USD", locale: "en-US" })}
          </p>
        </div>
        <button
          type="button"
          className={`${buttonClasses("secondary", "sm")} shrink-0 hover:bg-neutral-900 hover:text-white`}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
