import Image from "next/image";
import Link from "next/link";

export type Category = {
  id: string;
  title: string;
  image: string;
  description: string;
  href: string;
  subcategoryPreview?: string;
};

type Props = {
  category: Category;
};

export default function CategoryCard({ category }: Props) {
  return (
    <Link
      href={category.href}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-[0_30px_60px_-30px_rgba(74,14,26,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_40px_80px_-30px_rgba(139,30,45,0.22)]"
    >
      <Image
        src={category.image}
        alt={category.title}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover opacity-90 transition-all duration-[1000ms] ease-out group-hover:scale-[1.05] group-hover:opacity-100"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/0 transition-[box-shadow,ring-color] duration-300 group-hover:ring-gold/40"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold">
            Category
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl">
            {category.title}
          </h3>
          <p className="mt-2 max-w-xs text-xs text-paper-muted sm:text-sm">
            {category.description}
          </p>
          {category.subcategoryPreview ? (
            <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-gold/90 sm:text-[11px]">
              {category.subcategoryPreview}
            </p>
          ) : null}
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/60 text-sm text-gold transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-gold group-hover:text-ink sm:h-11 sm:w-11">
          →
        </span>
      </div>
    </Link>
  );
}
