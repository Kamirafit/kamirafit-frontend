"use client";

import Link from "next/link";
import { useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { useAdminCategories, useAdminProducts, useAdminUsers } from "@/services/admin";
import AdminCard from "../components/AdminCard";
import { EmptyState, ErrorState, LoadingState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

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

const QUICK_LINKS = [
  { href: "/dedicated-admin/products", label: "Add new product" },
  { href: "/dedicated-admin/categories", label: "Create a category" },
  { href: "/dedicated-admin/users", label: "Edit user contacts" },
  { href: "/", label: "Open the storefront" },
];

function PanelHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
      <h2 className="font-display text-[15px] font-semibold text-paper">
        {title}
      </h2>
      {action}
    </header>
  );
}

export default function DashboardPage() {
  const productsQuery = useAdminProducts();
  const usersQuery = useAdminUsers();
  const categoriesQuery = useAdminCategories();
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const isOnline = useOnlineStatus();

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

  if (!isOnline && products.length === 0 && users.length === 0 && categories.length === 0) {
    return <OfflineState onRetry={() => { void productsQuery.refetch(); void usersQuery.refetch(); void categoriesQuery.refetch(); }} />;
  }
  if (productsQuery.isLoading || usersQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingState label="Loading dashboard…" />;
  }
  if (productsQuery.isError || usersQuery.isError || categoriesQuery.isError) {
    return <ErrorState message="We couldn’t load the dashboard." onRetry={() => { void productsQuery.refetch(); void usersQuery.refetch(); void categoriesQuery.refetch(); }} />;
  }

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Overview"
        title="Dashboard"
        description="At-a-glance health of the KamiraFit catalog, community, and taxonomy."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <AdminCard key={k.label} padding="md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
              {k.label}
            </p>
            <p className="mt-3 font-display text-[28px] font-semibold leading-none text-paper">
              {k.value}
            </p>
            <p className="mt-2 text-[11.5px] text-paper-muted">{k.hint}</p>
          </AdminCard>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard className="lg:col-span-2">
          <PanelHeader
            title="Recent products"
            action={
              <Link
                href="/dedicated-admin/products"
                className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-bright"
              >
                Manage →
              </Link>
            }
          />
          {recent.length === 0 ? <div className="p-5"><EmptyState title="No products yet" description="Add a product to see catalog activity here." /></div> : <ul className="divide-y divide-line">
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
          </ul>}
        </AdminCard>

        <AdminCard>
          <PanelHeader title="Quick links" />
          <nav className="flex flex-col divide-y divide-line">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between px-5 py-3 text-[13px] text-paper transition-colors hover:bg-ink-2/60"
              >
                {link.label}
                <span
                  aria-hidden
                  className="text-paper-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold"
                >
                  →
                </span>
              </Link>
            ))}
          </nav>
        </AdminCard>
      </section>
    </div>
  );
}
