import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { buttonClasses } from "@/components/ui/Button";

const POPULAR_LINKS = [
  { label: "Kurti", href: "/shop?category=kurti" },
  { label: "Co-ords Sets", href: "/shop?category=co-ords-sets" },
  { label: "Dresses", href: "/shop?category=dresses" },
  { label: "T-Shirts", href: "/shop?category=t-shirts" },
  { label: "Oversized Tees", href: "/shop?category=oversized-t-shirts" },
  { label: "Hoodies", href: "/shop?category=hoodies" },
];

export default function NotFound() {
  return (
    <PageShell mainClassName="bg-ink flex items-center justify-center min-h-[calc(100vh-14rem)] py-12 sm:py-20 px-4">
      <div className="mx-auto w-full max-w-2xl text-center">
        {/* Glowing 404 Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold shadow-sm backdrop-blur-sm">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          404 Error · Page Not Found
        </div>

        {/* Large Decorative 404 Watermark */}
        <h1 className="mt-4 font-display text-7xl font-bold tracking-tight text-paper sm:text-8xl md:text-9xl">
          4<span className="text-gold">0</span>4
        </h1>

        {/* Headline */}
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl lg:text-4xl">
          The piece you’re looking for isn’t here.
        </h2>

        {/* Description */}
        <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-paper-muted">
          The page may have been moved, renamed, or never existed in our collection.
          Let’s get you back to discovering timeless style.
        </p>

        {/* Primary Navigation Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className={buttonClasses("primary", "md")}
          >
            Return to Home
          </Link>
          <Link
            href="/shop"
            className={buttonClasses("secondary", "md")}
          >
            Explore Collection
          </Link>
        </div>

        {/* Popular Categories Direct Quicklinks */}
        <div className="mt-12 border-t border-line/70 pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-paper-muted">
            Popular Categories
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {POPULAR_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-line bg-ink-2 px-3.5 py-1.5 text-xs text-paper transition-all duration-200 hover:border-gold hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
