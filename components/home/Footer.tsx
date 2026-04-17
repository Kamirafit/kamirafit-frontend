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
    <footer id="contact" className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-neutral-900"
            >
              Kamira<span className="text-neutral-500">Fit</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-600">
              Premium comfort. Effortless fashion. Crafted for the way you live.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  <Icon width={16} height={16} />
                </a>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-900">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-neutral-200 pt-8 text-xs text-neutral-500 sm:flex-row sm:items-center">
          <p>© {year} KamiraFit. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-neutral-900">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-neutral-900">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-neutral-900">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
