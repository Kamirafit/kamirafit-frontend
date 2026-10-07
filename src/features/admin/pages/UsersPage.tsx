"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SectionHeader from "@/components/ui/SectionHeader";
import type { AdminUser } from "@/types/entities";
import { useAdminUsers, useUpdateAdminUser } from "@/services/admin";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import TableActions from "../components/TableActions";
import DataTable, { type Column } from "../components/DataTable";
import SearchField from "../components/SearchField";
import UserFormModal from "../components/UserFormModal";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAdminToast } from "../context/AdminToastContext";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

type FilterType = "all" | "purchased" | "not_purchased";

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlFilterParam = searchParams.get("filter");
  const activeFilter: FilterType =
    urlFilterParam === "purchased" || urlFilterParam === "not_purchased"
      ? urlFilterParam
      : "all";

  const [filter, setFilter] = useState<FilterType>(activeFilter);

  // Sync state when URL query param changes
  useEffect(() => {
    if (urlFilterParam === "purchased" || urlFilterParam === "not_purchased") {
      setFilter(urlFilterParam);
    } else {
      setFilter("all");
    }
  }, [urlFilterParam]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  // Query backend with filter (if all, pass undefined to fetch all)
  const usersQuery = useAdminUsers({
    filter: filter === "all" ? undefined : filter,
  });
  const { data: users = [] } = usersQuery;
  const isLoading = usersQuery.isLoading || usersQuery.isFetching;
  const isOnline = useOnlineStatus();
  const updateMutation = useUpdateAdminUser();
  const { showSuccess } = useAdminToast();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);

  // Filter clientside to guarantee instant feedback and support search
  const filtered = useMemo(() => {
    let result = users;

    if (filter === "purchased") {
      result = result.filter(
        (u) => Boolean(u.hasPurchased) || (typeof u.ordersCount === "number" && u.ordersCount > 0),
      );
    } else if (filter === "not_purchased") {
      result = result.filter(
        (u) => !u.hasPurchased && (!u.ordersCount || u.ordersCount === 0),
      );
    }

    const q = query.trim().toLowerCase();
    if (!q) return result;
    return result.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q),
    );
  }, [users, query, filter]);

  // Counts for pills
  const counts = useMemo(() => {
    const purchased = users.filter(
      (u) => Boolean(u.hasPurchased) || (typeof u.ordersCount === "number" && u.ordersCount > 0),
    ).length;
    const notPurchased = Math.max(0, users.length - purchased);
    return {
      all: users.length,
      purchased,
      notPurchased,
    };
  }, [users]);

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "Customer",
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-[12px] font-semibold uppercase tracking-[0.08em] text-gold shrink-0">
            {initials(u.name)}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-paper truncate">{u.name}</span>
            <span className="text-[11px] text-paper-muted">{u.email}</span>
            {u.phone && <span className="text-[10.5px] text-paper-muted/80">{u.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "hasPurchased",
      label: "Purchase Status",
      render: (u) => {
        const hasBought =
          Boolean(u.hasPurchased) || (typeof u.ordersCount === "number" && u.ordersCount > 0);
        const orderCount = u.ordersCount || 0;

        return hasBought ? (
          <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Purchased
            </span>
            <span className="text-[11px] text-paper-muted font-medium">
              {orderCount} {orderCount === 1 ? "order" : "orders"} placed
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Not Purchased
            </span>
            <span className="text-[10.5px] text-paper-muted italic">
              0 orders placed
            </span>
          </div>
        );
      },
    },
    {
      key: "lastOrder",
      label: "Last Order",
      render: (u) => {
        const hasOrder = u.lastOrderAmount !== null && u.lastOrderAmount !== undefined;
        if (!hasOrder) {
          return <span className="text-paper-muted text-xs italic">Never ordered</span>;
        }

        return (
          <div className="flex flex-col">
            <span className="font-semibold text-paper text-[12.5px]">
              {formatPrice(u.lastOrderAmount!)}
            </span>
            <span className="text-[11px] text-paper-muted">
              {formatDate(u.lastOrderDate)}
            </span>
          </div>
        );
      },
    },
    {
      key: "address",
      label: "Address",
      render: (u) => {
        const count = u.addresses?.length || 0;
        return (
          <div className="flex flex-col max-w-xs">
            {u.address ? (
              <span className="truncate text-paper text-xs" title={u.address}>
                {u.address}
              </span>
            ) : (
              <span className="text-paper-muted text-xs italic">No address on file</span>
            )}
            {count > 0 && (
              <span className="text-[11px] text-gold/90 font-medium">
                {count} {count === 1 ? "address" : "addresses"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (u) => (
        <TableActions
          actions={[
            {
              label: "Manage",
              onClick: () => setEditing(u),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Community"
        title="Users"
        description="Registered customers — track purchase history, order values, and edit profile details."
      />

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-ink-2/60 p-1">
          <button
            type="button"
            onClick={() => handleFilterChange("all")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-ink shadow-sm text-gold border border-gold/30"
                : "text-paper-muted hover:text-paper"
            }`}
          >
            <span>All Customers</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                filter === "all" ? "bg-gold/15 text-gold" : "bg-ink-3 text-paper-muted"
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("purchased")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "purchased"
                ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/40 shadow-sm"
                : "text-paper-muted hover:text-emerald-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Purchased</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                filter === "purchased"
                  ? "bg-emerald-500/25 text-emerald-900"
                  : "bg-ink-3 text-paper-muted"
              }`}
            >
              {counts.purchased}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange("not_purchased")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === "not_purchased"
                ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 shadow-sm"
                : "text-paper-muted hover:text-amber-800"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Not Purchased</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                filter === "not_purchased"
                  ? "bg-amber-500/25 text-amber-950"
                  : "bg-ink-3 text-paper-muted"
              }`}
            >
              {counts.notPurchased}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search by name, email, phone…"
              label="Search users"
            />
          </div>
          <span className="text-[12px] text-paper-muted whitespace-nowrap">
            {filtered.length} shown
          </span>
        </div>
      </div>

      {!isOnline && users.length === 0 ? (
        <OfflineState onRetry={() => void usersQuery.refetch()} />
      ) : isLoading ? (
        <AdminTableSkeleton />
      ) : usersQuery.isError ? (
        <ErrorState message="We couldn’t load customers." onRetry={() => void usersQuery.refetch()} />
      ) : users.length === 0 ? (
        <EmptyState title="No customers yet" description="Registered customers will appear here." />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(u) => u.id}
          emptyLabel={
            filter === "purchased"
              ? "No customers with completed purchases found."
              : filter === "not_purchased"
              ? "No unconverted registered customers found."
              : "No users match your search."
          }
        />
      )}

      {updateMutation.isError ? (
        <ErrorState
          className="min-h-0 py-6"
          title="Customer not updated"
          message="Please try saving those changes again."
        />
      ) : null}

      <UserFormModal
        open={editing !== null}
        initial={editing}
        loading={updateMutation.isPending}
        onClose={() => setEditing(null)}
        onSubmit={(values) => {
          if (editing) {
            updateMutation.mutate(
              { id: editing.id, patch: values },
              {
                onSuccess: () => {
                  showSuccess(`Customer "${values.name}" updated successfully.`, "Customer Saved");
                  setEditing(null);
                },
              }
            );
          }
        }}
      />
    </div>
  );
}
