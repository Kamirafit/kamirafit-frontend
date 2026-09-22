"use client";

import Link from "next/link";
import { useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  useAdminStats,
  useAdminCategories,
  useAdminProducts,
} from "@/services/admin";
import type { AdminCategory } from "@/types/entities";
import AdminCard from "../components/AdminCard";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
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
  { href: "/dedicated-admin/orders", label: "Manage customer orders" },
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
  const statsQuery = useAdminStats();
  const productsQuery = useAdminProducts({ limit: 6 });
  const categoriesQuery = useAdminCategories();

  const isOnline = useOnlineStatus();
  const stats = statsQuery.data;
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const kpis: Kpi[] = useMemo(() => {
    if (stats) {
      return [
        {
          label: "Total Revenue",
          value: formatPrice(stats.totalRevenue ?? stats.salesTotal ?? 0),
          hint: `${stats.totalOrders ?? stats.ordersCount ?? 0} total orders`,
        },
        {
          label: "Products",
          value: String(stats.totalProducts ?? stats.productsCount ?? products.length),
          hint: `${categories.length} categories on file`,
        },
        {
          label: "Customers",
          value: String(stats.totalUsers ?? stats.usersCount ?? 0),
          hint: "Registered community",
        },
        {
          label: "Orders",
          value: String(stats.totalOrders ?? stats.ordersCount ?? 0),
          hint: `${stats.orderStatusCounts?.DELIVERED ?? 0} delivered`,
        },
      ];
    }

    const active = products.filter((p) => p.status === "active");
    const inactive = products.length - active.length;
    const avg = active.length
      ? Math.round(
          active.reduce((sum, p) => sum + p.price, 0) / active.length
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
        value: "—",
        hint: "Contact details on file",
      },
      {
        label: "Categories",
        value: String(categories.length),
        hint: `${categories.reduce((s: number, c: AdminCategory) => s + c.subcategories.length, 0)} subcategories`,
      },
      {
        label: "Avg. price",
        value: formatPrice(avg),
        hint: "Active SKUs only",
      },
    ];
  }, [stats, products, categories]);

  const recentProducts = useMemo(() => products.slice(0, 6), [products]);

  const isLoading =
    statsQuery.isLoading ||
    productsQuery.isLoading ||
    categoriesQuery.isLoading;

  if (!isOnline && !stats && products.length === 0) {
    return (
      <OfflineState
        onRetry={() => {
          void statsQuery.refetch();
          void productsQuery.refetch();
          void categoriesQuery.refetch();
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10 animate-pulse">
        <div className="h-8 w-48 rounded bg-ink-4" />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-line bg-ink p-5" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="h-64 rounded-2xl border border-line bg-ink lg:col-span-2" />
          <div className="h-64 rounded-2xl border border-line bg-ink" />
        </div>
      </div>
    );
  }

  if (statsQuery.isError && productsQuery.isError) {
    return (
      <ErrorState
        message="We couldn’t load the dashboard analytics."
        onRetry={() => {
          void statsQuery.refetch();
          void productsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Overview"
        title="Dashboard"
        description="At-a-glance health of the KamiraFit revenue, catalog, orders, and community."
      />

      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <AdminCard key={k.label} padding="md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
              {k.label}
            </p>
            <p className="mt-2 font-display text-[26px] font-semibold leading-none text-paper sm:text-[28px]">
              {k.value}
            </p>
            <p className="mt-2 text-[11.5px] text-paper-muted">{k.hint}</p>
          </AdminCard>
        ))}
      </section>

      {/* Order Status Breakdown when stats available */}
      {stats?.orderStatusCounts ? (
        <section className="rounded-2xl border border-line bg-ink p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
            Order Status Breakdown
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(stats.orderStatusCounts).map(([status, count]) => (
              <div
                key={status}
                className="flex flex-col rounded-xl border border-line/60 bg-ink-2/60 p-3"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-paper-muted">
                  {status.replace(/_/g, " ")}
                </span>
                <span className="mt-1 font-display text-lg font-bold text-paper">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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
          {recentProducts.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="No products yet"
                description="Add a product to see catalog activity here."
              />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {recentProducts.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-ink-2/60 sm:px-5"
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
          )}
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
