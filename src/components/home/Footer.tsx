"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCategories } from "@/services/category";
import { CATEGORIES as DEFAULT_CATEGORIES } from "@/data/categories";
import { FacebookIcon, InstagramIcon } from "./icons";

const SUPPORT_LINKS = [
  { label: "Contact", href: "#contact" },
  { label: "Shipping", href: "#contact" },
  { label: "Returns", href: "#contact" },
  { label: "Size Guide", href: "#contact" },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/kamirafit_clothing/?hl=en",
    Icon: InstagramIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1FnKyZnK16/?mibextid=wwXIfr",
    Icon: FacebookIcon,
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { data: rawCategories } = useCategories();

  const categories = useMemo(() => {
    const list =
      rawCategories && rawCategories.length > 0
        ? rawCategories
        : DEFAULT_CATEGORIES;

    return list
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
      className="relative border-t border-line bg-ink text-paper"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
      />
      <div className="w-full px-6 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-3">
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-[0.04em] text-paper transition-colors hover:text-gold"
            >
              Kamira<span className="text-gold">Fit</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper-muted">
              Premium comfort. Effortless fashion. Crafted for the way you live.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-ink-2/60 text-paper-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10 hover:text-gold"
                >
                  <Icon width={14} height={14} />
                </a>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-7">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
              Shop
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {categories.map((col) => (
                <div key={col.title} className="flex flex-col">
                  <Link
                    href={`/shop?category=${encodeURIComponent(col.title.toLowerCase().replace(/[\s_]+/g, "-"))}`}
                    className="font-display text-[14px] font-semibold text-paper transition-colors hover:text-gold"
                  >
                    {col.title}
                  </Link>
                  {col.items.length > 0 && (
                    <ul className="mt-3.5 space-y-2.5">
                      {col.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="text-[13px] text-paper-muted transition-colors duration-200 hover:text-gold"
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

          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
              Support
            </h3>
            <ul className="mt-6 space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[13px] text-paper-muted transition-colors duration-200 hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-xs text-paper-muted sm:flex-row sm:items-center">
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
