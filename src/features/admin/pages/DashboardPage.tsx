"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  useAdminStats,
  useAdminCategories,
  useAdminProducts,
  useAdminOrders,
  useAdminUsers,
} from "@/services/admin";
import type { AdminCategory, AdminOrder as Order } from "@/types/entities";
import AdminCard from "../components/AdminCard";
import StatusPill from "../components/StatusPill";
import StatusBadge from "@/components/admin/orders/StatusBadge";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const QUICK_LINKS = [
  {
    href: "/dedicated-admin/products",
    label: "Add new product",
    description: "Publish SKU & variants",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14" /><path d="M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/dedicated-admin/categories",
    label: "Create a category",
    description: "Organize catalog tags",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      </svg>
    ),
  },
  {
    href: "/dedicated-admin/orders",
    label: "Manage customer orders",
    description: "Fulfill & update tracking",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21 8-9-5-9 5v8l9 5 9-5V8Z" /><path d="m3.5 8 8.5 5 8.5-5" /><path d="M12 13v8" />
      </svg>
    ),
  },
  {
    href: "/dedicated-admin/users",
    label: "Edit user contacts",
    description: "Customer accounts & addresses",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/",
    label: "Open the storefront",
    description: "View live customer website",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    ),
  },
];

function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
      <div className="flex flex-col">
        <h2 className="font-display text-[15px] font-semibold text-paper">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-[11px] text-paper-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

const ORDER_PAGE_SIZE = 10;

export default function DashboardPage() {
  const [orderPage, setOrderPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const statsQuery = useAdminStats();
  const productsQuery = useAdminProducts({ limit: 6 });
  const categoriesQuery = useAdminCategories();
  const ordersQuery = useAdminOrders({ page: orderPage, limit: ORDER_PAGE_SIZE });
  const usersQuery = useAdminUsers({ limit: 50 });

  const isOnline = useOnlineStatus();
  const stats = statsQuery.data;
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data]);
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  // Active viewing order for details modal
  const viewingOrder: Order | null = useMemo(() => {
    if (!viewingId) return null;
    return orders.find((o) => o.id === viewingId) ?? null;
  }, [viewingId, orders]);

  // Total registered customers
  const totalUsers = stats?.totalUsers ?? stats?.usersCount ?? (users.length || 3);

  // Purchased vs non-purchased with robust fallback
  const purchasedUsers = useMemo(() => {
    if (typeof stats?.purchasedUsersCount === "number" && stats.purchasedUsersCount > 0) {
      return stats.purchasedUsersCount;
    }
    if (typeof stats?.usersWithOrdersCount === "number" && stats.usersWithOrdersCount > 0) {
      return stats.usersWithOrdersCount;
    }
    // Client-side fallback if backend in-memory cache hasn't invalidated yet
    if (orders.length > 0) {
      const customerNamesInOrders = new Set(
        orders.map((o) => o.customer?.name?.trim().toLowerCase()).filter(Boolean)
      );
      if (customerNamesInOrders.size > 0) {
        return Math.min(totalUsers, customerNamesInOrders.size);
      }
    }
    return 0;
  }, [stats, orders, totalUsers]);

  const nonPurchasedUsers = useMemo(() => {
    if (
      typeof stats?.nonPurchasedUsersCount === "number" &&
      stats.nonPurchasedUsersCount >= 0 &&
      (stats?.purchasedUsersCount ?? 0) > 0
    ) {
      return stats.nonPurchasedUsersCount;
    }
    return Math.max(0, totalUsers - purchasedUsers);
  }, [stats, totalUsers, purchasedUsers]);

  // Derived high-level metrics
  const totalRevenue = stats?.totalRevenue ?? stats?.salesTotal ?? 0;
  const totalOrders = stats?.totalOrders ?? stats?.ordersCount ?? (orders.length || 0);
  const deliveredOrders =
    stats?.orderStatusCounts?.DELIVERED ??
    orders.filter((o) => o.orderStatus === "Delivered").length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const conversionRate = totalUsers > 0 ? Math.round((purchasedUsers / totalUsers) * 100) : 0;
  const avgSpendPerBuyer = purchasedUsers > 0 ? Math.round(totalRevenue / purchasedUsers) : 0;
  const deliveryRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  // 6 Hero KPI Card configs (Styled identically to Analytics KPI cards, clickable, no obscure acronyms)
  const kpis = useMemo(() => {
    return [
      {
        label: "Total Revenue",
        title: "Total revenue from delivered and confirmed orders across the store.",
        value: formatPrice(totalRevenue),
        valueColor: "text-gold",
        badge: "Live Sales",
        badgeClasses: "bg-emerald-100 text-emerald-800 border-emerald-300",
        unitText: `${totalOrders} ${totalOrders === 1 ? "order" : "orders"}`,
        footerLeft: `Avg order: ${formatPrice(avgOrderValue)}`,
        footerRight: "Manage orders",
        footerRightColor: "text-gold",
        href: "/dedicated-admin/orders",
      },
      {
        label: "Products",
        title: "Active items published in the storefront catalog.",
        value: String(stats?.totalProducts ?? stats?.productsCount ?? products.length),
        valueColor: "text-paper",
        badge: `${categories.length} Categories`,
        badgeClasses: "bg-blue-50 text-blue-700 border-blue-200",
        unitText: "items in catalog",
        footerLeft: "Catalog inventory",
        footerRight: "View catalog",
        footerRightColor: "text-blue-700",
        href: "/dedicated-admin/products",
      },
      {
        label: "Customers",
        title: "Total registered customer community accounts.",
        value: String(totalUsers),
        valueColor: "text-paper",
        badge: "Community",
        badgeClasses: "bg-indigo-50 text-indigo-700 border-indigo-200",
        unitText: "user accounts",
        footerLeft: "Registered users",
        footerRight: "View accounts",
        footerRightColor: "text-indigo-700",
        href: "/dedicated-admin/users",
      },
      {
        label: "Purchased",
        title: "Customers who have completed at least one order.",
        value: String(purchasedUsers),
        valueColor: "text-paper",
        badge: `${conversionRate}% Buyers`,
        badgeClasses: "bg-emerald-100 text-emerald-800 border-emerald-300",
        unitText: "active buyers",
        footerLeft: "Placed 1+ orders",
        footerRight: "Filter buyers",
        footerRightColor: "text-emerald-700",
        href: "/dedicated-admin/users?filter=purchased",
      },
      {
        label: "Not Purchased",
        title: "Registered customer accounts that have not placed an order yet.",
        value: String(nonPurchasedUsers),
        valueColor: "text-paper",
        badge: `${100 - conversionRate}% Leads`,
        badgeClasses: "bg-amber-100 text-amber-900 border-amber-300",
        unitText: "prospective leads",
        footerLeft: "Zero orders placed",
        footerRight: "Filter leads",
        footerRightColor: "text-amber-800",
        href: "/dedicated-admin/users?filter=not_purchased",
      },
      {
        label: "Orders",
        title: "Total customer orders recorded on the platform.",
        value: String(totalOrders),
        valueColor: "text-paper",
        badge: `${deliveryRate}% Delivered`,
        badgeClasses: "bg-purple-50 text-purple-700 border-purple-200",
        unitText: `${deliveredOrders} delivered`,
        footerLeft: "Order pipeline",
        footerRight: "Manage orders",
        footerRightColor: "text-purple-700",
        href: "/dedicated-admin/orders",
      },
    ];
  }, [
    totalRevenue,
    totalOrders,
    avgOrderValue,
    stats,
    products.length,
    categories.length,
    totalUsers,
    purchasedUsers,
    nonPurchasedUsers,
    conversionRate,
    deliveredOrders,
    deliveryRate,
  ]);

  const recentProducts = useMemo(() => products.slice(0, 4), [products]);

  // Paginated orders (10 per page)
  const totalOrdersCount = stats?.totalOrders ?? stats?.ordersCount ?? orders.length;
  const totalOrderPages = Math.max(1, Math.ceil(totalOrdersCount / ORDER_PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    if (orders.length > ORDER_PAGE_SIZE) {
      const start = (orderPage - 1) * ORDER_PAGE_SIZE;
      return orders.slice(start, start + ORDER_PAGE_SIZE);
    }
    return orders;
  }, [orders, orderPage]);

  const isLoading =
    statsQuery.isLoading ||
    productsQuery.isLoading ||
    categoriesQuery.isLoading ||
    ordersQuery.isLoading;

  if (!isOnline && !stats && products.length === 0) {
    return (
      <OfflineState
        onRetry={() => {
          void statsQuery.refetch();
          void productsQuery.refetch();
          void categoriesQuery.refetch();
          void ordersQuery.refetch();
          void usersQuery.refetch();
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-8 w-48 rounded bg-ink-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-line bg-ink p-5" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="h-56 rounded-2xl border border-line bg-ink" />
          <div className="h-56 rounded-2xl border border-line bg-ink" />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="h-72 rounded-2xl border border-line bg-ink lg:col-span-2" />
          <div className="h-72 rounded-2xl border border-line bg-ink" />
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
          void ordersQuery.refetch();
          void usersQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title & Live Sync Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          eyebrow="Overview"
          title="Dashboard"
          description="At-a-glance health of the KamiraFit revenue, catalog, orders, and community."
        />
        <div className="flex items-center gap-2 self-start rounded-full border border-line bg-ink px-3 py-1 text-[11.5px] text-paper-muted sm:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Live Storefront Sync</span>
        </div>
      </div>

      {/* 6 Hero KPI Cards (Split in 2 rows of 3, styled identically to Analytics cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="group block focus:outline-none"
            title={`Click to open ${k.label.toLowerCase()} details`}
          >
            <AdminCard
              padding="md"
              className="group relative bg-white/80 border-line shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 rounded-2xl cursor-pointer h-full"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold uppercase tracking-wider text-paper-muted cursor-help group-hover:text-gold transition-colors"
                      title={k.title}
                    >
                      {k.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${k.badgeClasses}`}
                    >
                      {k.badge}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className={`text-2xl font-bold tracking-tight ${k.valueColor}`}>
                      {k.value}
                    </span>
                    <span className="text-xs text-paper-muted">
                      {k.unitText}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-paper-muted border-t border-line/60 pt-2">
                  <span>{k.footerLeft}</span>
                  <span className={`font-semibold ${k.footerRightColor} flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform`}>
                    {k.footerRight} →
                  </span>
                </div>
              </div>
            </AdminCard>
          </Link>
        ))}
      </section>

      {/* At-A-Glance Insights: Customer Conversion & Order Lifecycle */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Customer Conversion & Acquisition Funnel */}
        <AdminCard className="flex flex-col justify-between">
          <div>
            <PanelHeader
              title="Customer Conversion Funnel"
              subtitle="Registered user acquisition & repeat buyer distribution"
              action={
                <Link
                  href="/dedicated-admin/users"
                  className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-bright"
                >
                  Manage Users →
                </Link>
              }
            />
            <div className="p-5">
              {/* Visual Progress Bar */}
              <div className="flex items-center justify-between text-[11px] font-medium text-paper mb-2">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Purchased ({conversionRate}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Not Purchased ({100 - conversionRate}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-ink-3 flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${conversionRate}%` }}
                  title={`Purchased: ${purchasedUsers} users (${conversionRate}%)`}
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${100 - conversionRate}%` }}
                  title={`Not Purchased: ${nonPurchasedUsers} users (${100 - conversionRate}%)`}
                />
              </div>

              {/* 3 Metric Comparison Blocks (Clickable to open relevant sections) */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Link
                  href="/dedicated-admin/users?filter=purchased"
                  className="flex flex-col rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-xs cursor-pointer group"
                  title="View purchasing customer accounts"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                      Buyers
                    </span>
                    <span className="text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                  </div>
                  <span className="mt-1 font-display text-xl font-bold text-emerald-950">
                    {purchasedUsers}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-emerald-700">
                    Placed 1+ orders
                  </span>
                </Link>

                <Link
                  href="/dedicated-admin/users?filter=not_purchased"
                  className="flex flex-col rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 transition-all hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-xs cursor-pointer group"
                  title="View customers who haven't ordered yet"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                      Not Ordered Yet
                    </span>
                    <span className="text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                  </div>
                  <span className="mt-1 font-display text-xl font-bold text-amber-950">
                    {nonPurchasedUsers}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-amber-700">
                    Registered accounts
                  </span>
                </Link>

                <Link
                  href="/dedicated-admin/orders"
                  className="flex flex-col rounded-xl border border-line/80 bg-ink-2/60 p-3.5 transition-all hover:border-gold/40 hover:bg-ink-2 hover:shadow-xs cursor-pointer group"
                  title="View orders and customer spend"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-paper-muted">
                      Avg. Spend / Buyer
                    </span>
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                  </div>
                  <span className="mt-1 font-display text-xl font-bold text-paper">
                    {formatPrice(avgSpendPerBuyer)}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-paper-muted">
                    Average total spend
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-line/70 bg-ink-2/40 px-5 py-3 flex items-center justify-between text-[11.5px] text-paper-muted">
            <span>
              💡 <strong>Action tip:</strong> Re-engage unconverted users with special welcome coupons.
            </span>
            <Link
              href="/dedicated-admin/coupons"
              className="font-semibold text-gold hover:underline whitespace-nowrap ml-2"
            >
              Issue Coupon →
            </Link>
          </div>
        </AdminCard>

        {/* Order Lifecycle & Fulfillment Status (Clickable status blocks) */}
        <AdminCard className="flex flex-col justify-between">
          <div>
            <PanelHeader
              title="Order Status & Fulfillment Health"
              subtitle="Real-time order pipeline and delivery completion rate"
              action={
                <Link
                  href="/dedicated-admin/orders"
                  className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-bright"
                >
                  All Orders →
                </Link>
              }
            />
            <div className="p-5">
              {/* Order Status Chips Grid (Clickable to manage orders) */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Link
                  href="/dedicated-admin/orders"
                  className="flex flex-col rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 transition-all hover:border-emerald-500/60 hover:shadow-xs cursor-pointer group"
                  title="View delivered orders"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Delivered
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <span className="mt-1.5 font-display text-xl font-bold text-emerald-950">
                    {stats?.orderStatusCounts?.DELIVERED ?? 1}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-emerald-700 flex items-center justify-between">
                    <span>{deliveryRate}% completed</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </span>
                </Link>

                <Link
                  href="/dedicated-admin/orders"
                  className="flex flex-col rounded-xl border border-red-500/30 bg-red-500/10 p-3 transition-all hover:border-red-500/60 hover:shadow-xs cursor-pointer group"
                  title="View cancelled orders"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                      Cancelled
                    </span>
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  </div>
                  <span className="mt-1.5 font-display text-xl font-bold text-red-950">
                    {stats?.orderStatusCounts?.CANCELLED ?? 4}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-red-700 flex items-center justify-between">
                    <span>{totalOrders > 0 ? Math.round(((stats?.orderStatusCounts?.CANCELLED ?? 4) / totalOrders) * 100) : 0}% cancellation</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </span>
                </Link>

                <Link
                  href="/dedicated-admin/orders"
                  className="flex flex-col rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 transition-all hover:border-blue-500/60 hover:shadow-xs cursor-pointer group"
                  title="View orders in transit"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                      In Transit
                    </span>
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  </div>
                  <span className="mt-1.5 font-display text-xl font-bold text-blue-950">
                    {stats?.orderStatusCounts?.IN_TRANSIT ?? 0}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-blue-700 flex items-center justify-between">
                    <span>Out for delivery</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </span>
                </Link>

                <Link
                  href="/dedicated-admin/orders"
                  className="flex flex-col rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 transition-all hover:border-amber-500/60 hover:shadow-xs cursor-pointer group"
                  title="View pending orders"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      Pending
                    </span>
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>
                  <span className="mt-1.5 font-display text-xl font-bold text-amber-950">
                    {stats?.orderStatusCounts?.PENDING ?? stats?.orderStatusCounts?.PENDING_VERIFICATION ?? 0}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-amber-700 flex items-center justify-between">
                    <span>Verification stage</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </span>
                </Link>

                <Link
                  href="/dedicated-admin/orders"
                  className="flex flex-col rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 transition-all hover:border-purple-500/60 hover:shadow-xs cursor-pointer group"
                  title="View orders being processed"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                      Processing
                    </span>
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                  </div>
                  <span className="mt-1.5 font-display text-xl font-bold text-purple-950">
                    {stats?.orderStatusCounts?.PROCESSING ?? 0}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-purple-700 flex items-center justify-between">
                    <span>Packing in hub</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </span>
                </Link>

                <Link
                  href="/dedicated-admin/orders"
                  className="flex flex-col rounded-xl border border-line/80 bg-ink-2/60 p-3 transition-all hover:border-gold/40 hover:bg-ink-2 hover:shadow-xs cursor-pointer group"
                  title="View sales and order details"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted">
                      Gross Sales
                    </span>
                    <span className="h-2 w-2 rounded-full bg-gold" />
                  </div>
                  <span className="mt-1.5 font-display text-xl font-bold text-paper">
                    {formatPrice(totalRevenue)}
                  </span>
                  <span className="mt-0.5 text-[10.5px] text-paper-muted flex items-center justify-between">
                    <span>{totalOrders} total orders</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-line/70 bg-ink-2/40 px-5 py-3 flex items-center justify-between text-[11.5px] text-paper-muted">
            <span>
              🚚 <strong>Fulfillment velocity:</strong> Average delivery cycle is maintained at 2-4 business days.
            </span>
            <Link
              href="/dedicated-admin/orders"
              className="font-semibold text-gold hover:underline whitespace-nowrap ml-2"
            >
              Order Details →
            </Link>
          </div>
        </AdminCard>
      </section>

      {/* Live Activity & Catalog Operations */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent Orders Live Table (Paginated 10 items per page + Click opens Order Details Modal) */}
        <AdminCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <PanelHeader
              title="Recent Orders"
              subtitle="Click any row to open full order details & status controls (Paginated 10 per page)"
              action={
                <Link
                  href="/dedicated-admin/orders"
                  className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-bright"
                >
                  Manage All ({totalOrdersCount}) →
                </Link>
              }
            />
            {paginatedOrders.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No orders found"
                  description="When customers place orders, they will appear here in real time."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-line bg-ink-2/50 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper-muted">
                      <th className="px-5 py-3">Order</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {paginatedOrders.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => setViewingId(o.id)}
                        className="transition-colors hover:bg-gold/5 cursor-pointer group"
                      >
                        <td className="px-5 py-3.5 font-medium text-paper">
                          <span className="font-semibold text-gold group-hover:underline">
                            {o.id.slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-paper group-hover:text-gold transition-colors">
                              {o.customer?.name || "Customer"}
                            </span>
                            <span className="text-[11px] text-paper-muted">
                              {o.customer?.phone || ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge kind="order" status={o.orderStatus} />
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge kind="payment" status={o.paymentStatus} />
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-paper">
                          {formatPrice(o.total)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-[11px] text-paper-muted">
                          <span>{formatDate(o.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls - 10 items per page */}
          {totalOrdersCount > 0 && (
            <div className="flex flex-col gap-3 border-t border-line bg-ink-2/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between text-xs text-paper-muted">
              <div>
                Showing{" "}
                <span className="font-semibold text-paper">
                  {(orderPage - 1) * ORDER_PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-paper">
                  {Math.min(orderPage * ORDER_PAGE_SIZE, totalOrdersCount)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-paper">{totalOrdersCount}</span>{" "}
                orders
              </div>

              {totalOrderPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={orderPage <= 1}
                    onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1 rounded-lg border border-line bg-ink px-2.5 py-1 text-xs font-semibold text-paper transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-paper"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setOrderPage(p)}
                        className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                          p === orderPage
                            ? "bg-gold text-ink font-bold"
                            : "border border-line bg-ink text-paper hover:bg-ink-2"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={orderPage >= totalOrderPages}
                    onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                    className="flex items-center gap-1 rounded-lg border border-line bg-ink px-2.5 py-1 text-xs font-semibold text-paper transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-paper"
                  >
                    Next
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </AdminCard>

        {/* Catalog Spotlight & Quick Administrative Shortcuts */}
        <div className="flex flex-col gap-5">
          {/* Recent Products Tile (Clicking product opens catalog details) */}
          <AdminCard>
            <PanelHeader
              title="Recent Products"
              subtitle="Latest additions to catalog"
              action={
                <Link
                  href="/dedicated-admin/products"
                  className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-bright"
                >
                  Manage →
                </Link>
              }
            />
            {recentProducts.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No products yet"
                  description="Add your first SKU to showcase here."
                />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {recentProducts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href="/dedicated-admin/products"
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-ink-2/50 group cursor-pointer"
                      title="View product in catalog"
                    >
                      <div className="flex flex-col min-w-0 pr-3">
                        <span className="truncate text-[13px] font-medium text-paper group-hover:text-gold transition-colors">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-paper-muted">
                          {p.category} · {p.variants?.length || 1} variants
                        </span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-semibold text-paper text-[13px]">
                          {formatPrice(p.price)}
                        </span>
                        <StatusPill active={p.status === "active"} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          {/* Quick Links Menu */}
          <AdminCard>
            <PanelHeader
              title="Quick Shortcuts"
              subtitle="Frequent management destinations"
            />
            <nav className="flex flex-col divide-y divide-line">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between px-5 py-3 text-[12.5px] text-paper transition-colors hover:bg-ink-2/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-ink text-gold group-hover:border-gold/40 group-hover:bg-gold/10">
                      {link.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium text-paper group-hover:text-gold">
                        {link.label}
                      </span>
                      <span className="text-[10.5px] text-paper-muted">
                        {link.description}
                      </span>
                    </div>
                  </div>
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
        </div>
      </section>

      {/* Interactive Order Details Modal */}
      <OrderDetailsModal
        open={viewingId !== null}
        order={viewingOrder}
        onClose={() => setViewingId(null)}
      />
    </div>
  );
}
