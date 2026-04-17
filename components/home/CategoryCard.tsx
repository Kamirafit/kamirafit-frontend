import Image from "next/image";

export type Category = {
  id: string;
  title: string;
  image: string;
  description: string;
};

type Props = {
  category: Category;
};

export default function CategoryCard({ category }: Props) {
  return (
    <a
      href={`#${category.id}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-200"
    >
      <Image
        src={category.image}
        alt={category.title}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
        <div>
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {category.title}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            {category.description}
          </p>
        </div>
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/60 text-sm transition-colors group-hover:bg-white group-hover:text-neutral-900">
          →
        </span>
      </div>
    </a>
  );
}
