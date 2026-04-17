import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YoutubeIcon,
} from "./icons";

const LINK_COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Oversized Tees", href: "#oversized-tees" },
      { label: "Regular Fit", href: "#regular-fit" },
      { label: "Hoodies", href: "#hoodies" },
      { label: "New Arrivals", href: "#shop" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Sustainability", href: "#about" },
      { label: "Careers", href: "#about" },
      { label: "Press", href: "#about" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "#contact" },
      { label: "Shipping", href: "#contact" },
      { label: "Returns", href: "#contact" },
      { label: "Size Guide", href: "#contact" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "Twitter", href: "#", Icon: TwitterIcon },
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "YouTube", href: "#", Icon: YoutubeIcon },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="relative border-t border-line bg-ink text-paper"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
      />
      <div className="w-full px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-[0.08em] text-paper transition-colors hover:text-gold"
            >
              Kamira<span className="text-gold">Fit</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper-muted">
              Premium comfort. Effortless fashion. Crafted for the way you live.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-paper-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                >
                  <Icon width={16} height={16} />
                </a>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-paper-muted transition-colors hover:text-gold"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-xs text-paper-muted/80 sm:flex-row sm:items-center">
          <p>© {year} KamiraFit. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-gold">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-gold">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-gold">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
