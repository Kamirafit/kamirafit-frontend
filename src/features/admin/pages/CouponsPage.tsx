"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import type { AdminCoupon, AdminCategory, CreateCouponDto, UpdateCouponDto } from "@/types/entities";
import {
  useAdminCoupons,
  useCreateAdminCoupon,
  useUpdateAdminCoupon,
  useToggleAdminCoupon,
  useDeleteAdminCoupon,
  useAdminCategories,
} from "@/services/admin";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import TableActions from "../components/TableActions";
import AdminCard from "../components/AdminCard";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable, { type Column } from "../components/DataTable";
import SearchField from "../components/SearchField";
import StatusPill from "../components/StatusPill";
import CouponFormModal from "../components/CouponFormModal";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return "Never";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Invalid date";
  }
}

function isCouponExpired(endDate?: string | null): boolean {
  if (!endDate) return false;
  return new Date(endDate).getTime() < Date.now();
}

type FilterStatus = "all" | "active" | "inactive" | "expired";

export default function CouponsPage() {
  const isOnline = useOnlineStatus();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const couponsQuery = useAdminCoupons({
    search: search.trim() || undefined,
    status: statusFilter,
  });
  const { data: categories = [] } = useAdminCategories();

  const createMutation = useCreateAdminCoupon();
  const updateMutation = useUpdateAdminCoupon();
  const toggleMutation = useToggleAdminCoupon();
  const deleteMutation = useDeleteAdminCoupon();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Map category IDs to category names
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat: AdminCategory) => {
      map.set(cat.id, cat.name);
    });
    return map;
  }, [categories]);

  const coupons = couponsQuery.data?.coupons || [];
  const rawCoupons = couponsQuery.data?.items || coupons;
  const deletingCoupon = deletingId
    ? rawCoupons.find((c: AdminCoupon) => c.id === deletingId) ?? null
    : null;

  // Compute KPI stats
  const totalCount = couponsQuery.data?.total ?? rawCoupons.length;
  const activeCount =
    couponsQuery.data?.activeCount ??
    rawCoupons.filter((c: AdminCoupon) => c.isActive && !isCouponExpired(c.endDate)).length;
  const expiredCount =
    couponsQuery.data?.expiredCount ??
    rawCoupons.filter((c: AdminCoupon) => isCouponExpired(c.endDate)).length;
  const totalUsed = rawCoupons.reduce((acc: number, c: AdminCoupon) => acc + (c.usedCount || 0), 0);

  const columns: Column<AdminCoupon>[] = [
    {
      key: "code",
      label: "Coupon Code & Details",
      render: (c) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13.5px] font-bold tracking-wider text-gold bg-gold/10 px-2.5 py-0.5 rounded border border-gold/30">
              {c.code}
            </span>
            {isCouponExpired(c.endDate) ? (
              <span className="text-[10.5px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                Expired
              </span>
            ) : !c.isActive ? (
              <span className="text-[10.5px] font-semibold text-paper-muted bg-ink-2 border border-line px-2 py-0.5 rounded-full">
                Inactive
              </span>
            ) : (
              <span className="text-[10.5px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Live
              </span>
            )}
          </div>
          {c.description ? (
            <span className="text-[12px] text-paper-muted line-clamp-1 max-w-xs sm:max-w-sm">
              {c.description}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      render: (c) => {
        const isPercentage = c.discountType === "PERCENTAGE";
        const val = c.discountValue ?? c.discountVal ?? 0;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[13.5px] font-semibold text-paper">
              {isPercentage ? `${val}% OFF` : `₹${val} FLAT OFF`}
            </span>
            {isPercentage && c.maxDiscount ? (
              <span className="text-[11px] text-paper-muted">
                Up to ₹{c.maxDiscount}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "conditions",
      label: "Conditions",
      render: (c) => {
        const catIds = c.applicableCategoryIds || [];
        return (
          <div className="flex flex-col gap-1.5 max-w-xs">
            {/* Cart value condition */}
            <div className="flex items-center gap-1.5 text-[11.5px]">
              <span className="text-paper-muted">Min Cart:</span>
              <span className="font-medium text-paper">
                {c.minOrderVal ? `₹${c.minOrderVal}` : "None"}
              </span>
            </div>

            {/* Collection conditions */}
            <div className="flex flex-wrap gap-1">
              {catIds.length === 0 ? (
                <span className="inline-flex items-center rounded-full border border-line bg-ink-2 px-2 py-0.5 text-[10.5px] font-medium text-paper-muted">
                  All Collections
                </span>
              ) : (
                catIds.map((id) => {
                  const name = categoryMap.get(id) || "Collection";
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center rounded-full border border-gold/30 bg-gold/5 px-2 py-0.5 text-[10.5px] font-medium text-gold"
                    >
                      {name}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "validity",
      label: "Validity Period",
      render: (c) => {
        const expired = isCouponExpired(c.endDate);
        return (
          <div className="flex flex-col gap-1">
            {c.endDate ? (
              <div className="flex items-center gap-1.5 text-[12px]">
                <span className="text-paper-muted">Expires:</span>
                <span className={expired ? "text-rose-400 font-medium" : "text-paper font-medium"}>
                  {formatDateDisplay(c.endDate)}
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 w-fit">
                <span>∞</span> Never Expires
              </span>
            )}
            <div className="text-[11px] text-paper-muted">
              Starts: {formatDateDisplay(c.startDate)}
            </div>
          </div>
        );
      },
    },
    {
      key: "usage",
      label: "Usage",
      render: (c) => (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-paper">
            {c.usedCount}
            <span className="text-paper-muted text-[11.5px]">
              {" "}
              / {c.usageLimit != null ? c.usageLimit : "∞"}
            </span>
          </span>
          {c.usageLimit ? (
            <div className="h-1.5 w-20 rounded-full bg-ink-2 overflow-hidden border border-line">
              <div
                className="h-full bg-gold transition-all"
                style={{
                  width: `${Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100))}%`,
                }}
              />
            </div>
          ) : (
            <span className="text-[10.5px] text-paper-muted">Unlimited uses</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (c) => (
        <button
          type="button"
          onClick={() => toggleMutation.mutate(c.id)}
          disabled={toggleMutation.isPending}
          title="Click to toggle coupon active status"
          className="cursor-pointer transition-opacity hover:opacity-80"
        >
          <StatusPill active={c.isActive} />
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (c) => (
        <TableActions
          actions={[
            {
              label: "Edit",
              onClick: () => {
                setEditingCoupon(c);
                setFormOpen(true);
              },
              icon: (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              ),
            },
            {
              label: "Delete",
              tone: "danger",
              onClick: () => setDeletingId(c.id),
              icon: (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ),
            },
          ]}
        />
      ),
    },
  ];

  const handleFormSubmit = (payload: CreateCouponDto) => {
    if (editingCoupon) {
      const updateData: UpdateCouponDto = { ...payload };
      updateMutation.mutate(
        { id: editingCoupon.id, data: updateData },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditingCoupon(null);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setFormOpen(false);
          setEditingCoupon(null);
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId, {
        onSuccess: () => {
          setDeletingId(null);
        },
      });
    }
  };

  const isLoading = couponsQuery.isLoading || couponsQuery.isFetching;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Promotions & Discounts"
        title="Coupons"
        description="Create and manage coupon codes with percentage or fixed discounts, optional expiration dates, cart thresholds, and collection conditions."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingCoupon(null);
              setFormOpen(true);
            }}
          >
            <PlusIcon />
            Create coupon
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminCard padding="md" className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
            Total Coupons
          </span>
          <span className="font-display text-2xl font-bold text-paper">
            {totalCount}
          </span>
        </AdminCard>

        <AdminCard padding="md" className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
            Active Now
          </span>
          <span className="font-display text-2xl font-bold text-emerald-400">
            {activeCount}
          </span>
        </AdminCard>

        <AdminCard padding="md" className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
            Expired
          </span>
          <span className="font-display text-2xl font-bold text-rose-400">
            {expiredCount}
          </span>
        </AdminCard>

        <AdminCard padding="md" className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper-muted">
            Total Redemptions
          </span>
          <span className="font-display text-2xl font-bold text-gold">
            {totalUsed}
          </span>
        </AdminCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search code or description…"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-ink-2 p-1 self-start sm:self-auto">
          {(["all", "active", "inactive", "expired"] as FilterStatus[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                statusFilter === st
                  ? "bg-gold text-ink"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content / Table */}
      {!isOnline && coupons.length === 0 ? (
        <OfflineState onRetry={() => void couponsQuery.refetch()} />
      ) : isLoading ? (
        <AdminTableSkeleton />
      ) : couponsQuery.isError ? (
        <ErrorState
          message="We couldn't load coupons. Please verify backend connection."
          onRetry={() => void couponsQuery.refetch()}
        />
      ) : coupons.length === 0 ? (
        <EmptyState
          title={search ? "No coupons match your search" : "No coupons created yet"}
          description={
            search
              ? "Try adjusting your search terms or filter."
              : "Create your first coupon to offer discounts to customers at checkout."
          }
          action={
            !search ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingCoupon(null);
                  setFormOpen(true);
                }}
              >
                <PlusIcon />
                Create coupon
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={coupons}
          getRowKey={(c) => c.id}
          emptyLabel="No coupons found."
        />
      )}

      {/* Mutation Error Notice */}
      {[createMutation, updateMutation, toggleMutation, deleteMutation].some(
        (m) => m.isError
      ) ? (
        <ErrorState
          className="min-h-0 py-4"
          title="Coupon operation failed"
          message={
            (createMutation.error as Error | null)?.message ||
            (updateMutation.error as Error | null)?.message ||
            (deleteMutation.error as Error | null)?.message ||
            "Please check input values and try again."
          }
        />
      ) : null}

      {/* Create / Edit Modal */}
      <CouponFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCoupon(null);
        }}
        onSubmit={handleFormSubmit}
        initial={editingCoupon}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deletingId !== null}
        loading={deleteMutation.isPending}
        onClose={() => setDeletingId(null)}
        title="Delete Coupon"
        description={`Are you sure you want to permanently delete coupon "${
          deletingCoupon?.code || "this coupon"
        }"? Past orders that used this coupon will not be affected, but customers will no longer be able to redeem it.`}
        confirmLabel="Delete Coupon"
        danger
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
