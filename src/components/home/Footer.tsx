"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCategories } from "@/services/category";
import { FacebookIcon, InstagramIcon } from "./icons";

const SUPPORT_LINKS = [
  { label: "Contact", href: "#contact" },
  { label: "Shipping", href: "#contact" },
  { label: "Returns", href: "#contact" },
  { label: "Size Guide", href: "#contact" },
];

const SOCIALS = [
  { label: "Instagram", href: "#", Icon: InstagramIcon },
  { label: "Facebook", href: "#", Icon: FacebookIcon },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { data: rawCategories } = useCategories();

  const categories = useMemo(() => {
    return (rawCategories || [])
      .filter((cat) => Boolean(cat && cat.name))
      .map((cat) => ({
        title: cat.name,
        items: (cat.subcategories || [])
          .map((sub) => {
            const label = typeof sub === "string" ? sub : sub.name || sub.title || "";
            const slug =
              typeof sub === "string"
                ? sub.toLowerCase().replace(/[\s_]+/g, "-")
                : sub.slug || (sub.name || "").toLowerCase().replace(/[\s_]+/g, "-");
            return {
              label,
              href: `/shop?category=${encodeURIComponent(slug)}`,
            };
          })
          .filter((item) => Boolean(item.label)),
      }));
  }, [rawCategories]);

  return (
    <footer
      id="contact"
      className="relative border-t border-white/10 bg-ink/80 text-paper backdrop-blur-md"
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-paper-muted backdrop-blur-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-gold hover:bg-gold/15 hover:text-gold"
                >
                  <Icon width={16} height={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
              Shop
            </h3>
            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {categories.map((col) => (
                <div key={col.title}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(col.title.toLowerCase().replace(/[\s_]+/g, "-"))}`}
                    className="font-display text-[13px] font-semibold text-paper transition-colors hover:text-gold"
                  >
                    {col.title}
                  </Link>
                  {col.items.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {col.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="text-[13px] text-paper-muted transition-colors duration-300 hover:text-gold"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
              Support
            </h3>
            <ul className="mt-5 space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-paper-muted transition-colors duration-300 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-paper-muted/80 sm:flex-row sm:items-center">
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
