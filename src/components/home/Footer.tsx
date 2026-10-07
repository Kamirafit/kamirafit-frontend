"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCategories } from "@/services/category";
import { FacebookIcon, InstagramIcon } from "./icons";
import { useContactModal } from "@/components/contact/ContactModalProvider";


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
  const { openContactModal } = useContactModal();

  const categories = useMemo(() => {
    const list = Array.isArray(rawCategories) ? rawCategories : [];

    return list
      .filter((cat) => Boolean(cat && cat.name))
      .map((cat) => {
        const catSlug = cat.slug || cat.name.toLowerCase().replace(/[\s_]+/g, "-");
        const subItems = (cat.subcategories || [])
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
          .filter((item) => Boolean(item.label));

        const items =
          subItems.length > 0
            ? subItems.slice(0, 5)
            : [{ label: `All ${cat.name}`, href: `/shop?category=${encodeURIComponent(catSlug)}` }];

        return {
          title: cat.name,
          items,
        };
      })
      .filter((cat) => cat.items.length > 0)
      .slice(0, 3);
  }, [rawCategories]);

  return (
    <footer
      id="support"
      className="w-full bg-[#200207] text-[#eae2e3] border-t border-white/10 pt-8 sm:pt-10 pb-10 sm:pb-12"
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Taxonomy Columns - Fits in 1 single clean row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-4">
          {/* Brand Intro */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between pr-4 sm:pr-6">
            <div>
              <Link
                href="/"
                className="font-serif text-3xl tracking-tight text-white font-medium italic block mb-2.5 hover:text-primary-fixed transition-colors"
              >
                Kamira<span className="font-sans not-italic font-bold">Fit</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-surface-tint ml-1 align-baseline" />
              </Link>
              <p className="font-sans text-xs text-white/60 font-light leading-relaxed max-w-sm">
                A clothing brand dedicated to premium, comfortable everyday wear.
                Designed for effortless style and lasting comfort.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-105"
                >
                  <Icon width={15} height={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Categories Columns */}
          {categories.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] uppercase font-mono tracking-widest text-primary-fixed mb-3">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-white/70 font-light">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright, One-Line Support & Legal Links, and Badges */}
        <div className="border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-light pt-5 mt-4">
          <p className="text-[11px] text-white/50 text-center lg:text-left">
            © {year} KamiraFit Creation Private Limited. All rights reserved.
          </p>

          {/* Support & Legal Links in ONE Horizontal Line */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-white/70 text-xs">
            <button
              type="button"
              onClick={openContactModal}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
            <Link href="/shipping" className="hover:text-white transition-colors">
              Shipping
            </Link>
            <Link href="/returns" className="hover:text-white transition-colors">
              Returns
            </Link>
            <Link href="/size-guide" className="hover:text-white transition-colors">
              Size Guide
            </Link>
            <span className="text-white/25 hidden sm:inline">|</span>
            <Link href="/privacy" className="hover:text-white transition-colors text-[11px] text-white/50">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors text-[11px] text-white/50">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors text-[11px] text-white/50">
              Cookies
            </Link>
          </div>

          {/* Compliance & Trust Badges */}
          <div className="flex items-center gap-3 text-white/50 text-[10px] uppercase font-mono tracking-wider">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              SSL Secure
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              100% Authentic
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
