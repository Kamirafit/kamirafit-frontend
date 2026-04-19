"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppSelector } from "@/features/product/hooks/redux";
import AdminPageHeader from "../components/AdminPageHeader";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

type Kpi = {
  label: string;
  value: string;
  hint: string;
};

export default function DashboardPage() {
  const products = useAppSelector((s) => s.adminProducts.items);
  const users = useAppSelector((s) => s.adminUsers.items);
  const categories = useAppSelector((s) => s.adminCategories.items);

  const kpis: Kpi[] = useMemo(() => {
    const active = products.filter((p) => p.status === "active");
    const inactive = products.length - active.length;
    const avg = active.length
      ? Math.round(
          active.reduce((sum, p) => sum + p.price, 0) / active.length,
        )
      : 0;
    return [
      {
        label: "Live products",
        value: String(active.length),
        hint: `${inactive} hidden from storefront`,
      },
      {
        label: "Customers",
        value: String(users.length),
        hint: "Contact details on file",
      },
      {
        label: "Categories",
        value: String(categories.length),
        hint: `${categories.reduce((s, c) => s + c.subcategories.length, 0)} subcategories`,
      },
      {
        label: "Avg. price",
        value: formatPrice(avg),
        hint: "Active SKUs only",
      },
    ];
  }, [products, users, categories]);

  const recent = useMemo(() => products.slice(0, 6), [products]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="At-a-glance health of the KamiraFit catalog, community, and taxonomy."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-line bg-ink p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
              {k.label}
            </p>
            <p className="mt-2 font-display text-[26px] font-semibold text-paper">
              {k.value}
            </p>
            <p className="mt-1 text-[11.5px] text-paper-muted">{k.hint}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-line bg-ink">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-[15px] font-semibold text-paper">
              Recent products
            </h2>
            <Link
              href="/dedicated-admin/products"
              className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-bright"
            >
              Manage →
            </Link>
          </header>
          <ul className="divide-y divide-line">
            {recent.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-ink-2/60"
              >
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-paper">
                    {p.name}
                  </span>
                  <span className="text-[11.5px] text-paper-muted">
                    {p.category} · {p.status}
                  </span>
                </div>
                <span className="font-semibold text-gold">
                  {formatPrice(p.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-ink">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-[15px] font-semibold text-paper">
              Quick links
            </h2>
          </header>
          <nav className="flex flex-col divide-y divide-line">
            {[
              { href: "/dedicated-admin/products", label: "Add new product" },
              { href: "/dedicated-admin/categories", label: "Create a category" },
              { href: "/dedicated-admin/users", label: "Edit user contacts" },
              { href: "/", label: "Open the storefront" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-5 py-3 text-[13px] text-paper transition-colors hover:bg-ink-2/60"
              >
                {link.label}
                <span
                  aria-hidden
                  className="text-paper-muted transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
