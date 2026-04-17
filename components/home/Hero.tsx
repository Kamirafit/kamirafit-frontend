import Image from "next/image";
import { buttonClasses } from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { ArrowRightIcon } from "./icons";

export default function Hero() {
  return (
    <section className="relative w-full border-b border-neutral-200 bg-neutral-50">
      <Container className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="order-2 lg:order-1">
          <span className="inline-block rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium uppercase tracking-widest text-neutral-600">
            New Collection · 2026
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Elevate Your
            <br />
            Everyday Style.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Premium comfort. Effortless fashion. Thoughtfully crafted essentials
            designed to move with you, day after day.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="/shop" className={`${buttonClasses("primary", "lg")} group`}>
              Shop Now
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#categories" className={buttonClasses("secondary", "lg")}>
              Explore Categories
            </a>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-8">
            <div>
              <dt className="text-xs uppercase tracking-widest text-neutral-500">
                Crafted in
              </dt>
              <dd className="mt-1 text-base font-semibold text-neutral-900">
                Portugal
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-neutral-500">
                Fabric
              </dt>
              <dd className="mt-1 text-base font-semibold text-neutral-900">
                Organic Cotton
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-neutral-500">
                Shipping
              </dt>
              <dd className="mt-1 text-base font-semibold text-neutral-900">
                Worldwide
              </dd>
            </div>
          </dl>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-200">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              alt="Model wearing KamiraFit essentials"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur">
              <span className="font-medium text-neutral-900">
                Spring Essentials
              </span>
              <span className="text-neutral-500">From $39</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
