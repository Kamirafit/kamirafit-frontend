import Image from "next/image";
import { buttonClasses } from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { ArrowRightIcon } from "./icons";

export default function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden border-b border-line bg-ink text-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-20 h-[340px] w-[340px] rounded-full bg-gold/5 blur-3xl"
      />

      <Container className="relative grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2 lg:gap-16 lg:py-32">
        <div className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink-2/60 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-gold backdrop-blur">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_0_3px_rgba(139,30,45,0.2)]"
            />
            New Collection · 2026
          </span>
          <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-paper sm:text-6xl lg:text-[72px]">
            Elevate Your
            <br />
            <span className="italic text-gold">Everyday</span> Style.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-paper-muted sm:text-lg">
            Premium comfort. Effortless fashion. Thoughtfully crafted essentials
            designed to move with you, day after day.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/shop"
              className={`${buttonClasses("primary", "lg")} group`}
            >
              Shop Now
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#categories" className={buttonClasses("secondary", "lg")}>
              Explore Categories
            </a>
          </div>

          <dl className="mt-16 grid grid-cols-3 gap-6 border-t border-line pt-8">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Crafted in
              </dt>
              <dd className="mt-2 font-display text-lg font-semibold text-paper">
                Portugal
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Fabric
              </dt>
              <dd className="mt-2 font-display text-lg font-semibold text-paper">
                Organic Cotton
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.28em] text-gold">
                Shipping
              </dt>
              <dd className="mt-2 font-display text-lg font-semibold text-paper">
                Worldwide
              </dd>
            </div>
          </dl>
        </div>

        <div className="order-1 lg:order-2">
          <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-[0_40px_80px_-40px_rgba(74,14,26,0.15)] transition-transform duration-700 hover:-translate-y-1">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              alt="Model wearing KamiraFit essentials"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink/90 to-transparent"
            />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-gold/30 bg-ink/80 px-4 py-3 text-sm backdrop-blur">
              <span className="font-display font-medium tracking-wide text-paper">
                Spring Essentials
              </span>
              <span className="font-display text-base font-semibold text-gold">
                From ₹3,200
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
