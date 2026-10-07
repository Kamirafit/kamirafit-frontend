"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SectionHeader from "@/components/ui/SectionHeader";
import type { AdminReview, AdminReviewStatus } from "@/types/entities";
import {
  useAdminReviews,
  useModerateAdminReview,
  useDeleteAdminReview,
} from "@/services/admin";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import TableActions from "../components/TableActions";
import DataTable, { type Column } from "../components/DataTable";
import SearchField from "../components/SearchField";
import ReviewDetailsModal from "../components/ReviewDetailsModal";
import AdminCard from "../components/AdminCard";
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

function StarIconFilled({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarIconEmpty({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

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

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

export default function ReviewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlStatusParam = searchParams.get("status")?.toUpperCase();
  const activeStatus: StatusFilter =
    urlStatusParam === "PENDING" ||
    urlStatusParam === "APPROVED" ||
    urlStatusParam === "REJECTED"
      ? (urlStatusParam as StatusFilter)
      : "ALL";

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(activeStatus);
  const [query, setQuery] = useState("");
  const [activeReview, setActiveReview] = useState<AdminReview | null>(null);

  useEffect(() => {
    if (
      urlStatusParam === "PENDING" ||
      urlStatusParam === "APPROVED" ||
      urlStatusParam === "REJECTED"
    ) {
      setStatusFilter(urlStatusParam as StatusFilter);
    } else {
      setStatusFilter("ALL");
    }
  }, [urlStatusParam]);

  const handleStatusFilterChange = (newStatus: StatusFilter) => {
    setStatusFilter(newStatus);
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === "ALL") {
      params.delete("status");
    } else {
      params.set("status", newStatus.toLowerCase());
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const reviewsQuery = useAdminReviews({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: query.trim() || undefined,
  });

  const moderateMutation = useModerateAdminReview();
  const deleteMutation = useDeleteAdminReview();
  const isOnline = useOnlineStatus();
  const { showSuccess, showError } = useAdminToast();

  const reviewsData = reviewsQuery.data;
  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.stats || {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "PENDING").length,
    approved: reviews.filter((r) => r.status === "APPROVED").length,
    rejected: reviews.filter((r) => r.status === "REJECTED").length,
  };

  const isLoading = reviewsQuery.isLoading || reviewsQuery.isFetching;

  // Filter client-side for ultra-fast instant responsiveness
  const filtered = useMemo(() => {
    let result = reviews;
    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }
    const q = query.trim().toLowerCase();
    if (!q) return result;
    return result.filter(
      (r) =>
        r.customer.name.toLowerCase().includes(q) ||
        (r.customer.email && r.customer.email.toLowerCase().includes(q)) ||
        r.product.name.toLowerCase().includes(q) ||
        (r.comment && r.comment.toLowerCase().includes(q))
    );
  }, [reviews, statusFilter, query]);

  // Average Rating of approved reviews (returns null if none exist)
  const avgRating = useMemo(() => {
    const approvedReviews = reviews.filter(
      (r) => r.status === "APPROVED" && typeof r.rating === "number" && r.rating > 0,
    );
    if (approvedReviews.length === 0) return null;
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / approvedReviews.length).toFixed(1);
  }, [reviews]);

  const handleQuickModerate = async (review: AdminReview, status: "APPROVED" | "REJECTED") => {
    try {
      await moderateMutation.mutateAsync({ id: review.id, status });
      showSuccess(
        status === "APPROVED"
          ? `Review by ${review.customer.name} approved & published live on storefront!`
          : `Review by ${review.customer.name} rejected and hidden.`,
        status === "APPROVED" ? "Review Verified" : "Review Rejected"
      );
      if (activeReview?.id === review.id) {
        setActiveReview((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      showError("Could not update review status. Please try again.");
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteMutation.mutateAsync(reviewId);
      showSuccess("Review deleted permanently.", "Review Deleted");
      if (activeReview?.id === reviewId) {
        setActiveReview(null);
      }
    } catch (err) {
      showError("Failed to delete review.");
    }
  };

  const columns: Column<AdminReview>[] = [
    {
      key: "product",
      label: "Product",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-ink-2/60 overflow-hidden">
            {r.product.image ? (
              <img
                src={r.product.image}
                alt={r.product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-gold">KF</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-paper truncate max-w-[170px]" title={r.product.name}>
              {r.product.name}
            </span>
            {r.product.slug && (
              <span className="text-[11px] text-paper-muted truncate font-mono">
                /{r.product.slug}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold shrink-0">
            {initials(r.customer.name)}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-paper text-xs">{r.customer.name}</span>
            <span className="text-[11px] text-paper-muted truncate max-w-[140px]">
              {r.customer.email || r.customer.phone || "Customer"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) =>
              i < r.rating ? (
                <StarIconFilled key={i} />
              ) : (
                <StarIconEmpty key={i} />
              )
            )}
          </div>
          <span className="font-bold text-xs text-paper">{r.rating}.0</span>
        </div>
      ),
    },
    {
      key: "comment",
      label: "Review & Media",
      render: (r) => (
        <div className="flex flex-col gap-1.5 max-w-xs">
          <span className="line-clamp-2 text-xs text-paper" title={r.comment || ""}>
            {r.comment || <em className="text-paper-muted">Rating only</em>}
          </span>
          {r.images && r.images.length > 0 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              {r.images.slice(0, 3).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Customer upload"
                  className="h-6 w-6 rounded border border-line object-cover"
                />
              ))}
              {r.images.length > 3 && (
                <span className="text-[10px] text-paper-muted font-medium">
                  +{r.images.length - 3} more
                </span>
              )}
              <span className="rounded-full bg-gold/10 px-1.5 py-0.2 text-[10px] font-semibold text-gold">
                {r.images.length} photos
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Verification Status",
      render: (r) => {
        if (r.status === "PENDING") {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              Pending Review
            </span>
          );
        }
        if (r.status === "APPROVED") {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live on Storefront
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Rejected / Hidden
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (r) => <span className="text-xs text-paper-muted">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          {r.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleQuickModerate(r, "APPROVED");
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all text-xs"
                title="Approve & Publish to Storefront"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleQuickModerate(r, "REJECTED");
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-700 hover:bg-rose-500 hover:text-white transition-all text-xs"
                title="Reject & Hide"
              >
                ✕
              </button>
            </>
          )}

          <TableActions
            actions={[
              {
                label: "Inspect & Verify",
                onClick: () => setActiveReview(r),
              },
              ...(r.status !== "APPROVED"
                ? [
                    {
                      label: "Approve Live",
                      onClick: () => void handleQuickModerate(r, "APPROVED"),
                    },
                  ]
                : []),
              ...(r.status !== "REJECTED"
                ? [
                    {
                      label: "Reject / Hide",
                      onClick: () => void handleQuickModerate(r, "REJECTED"),
                    },
                  ]
                : []),
              {
                label: "Delete",
                tone: "danger",
                onClick: () => void handleDelete(r.id),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Customers & Support"
        title="Reviews & Verification"
        description="Verify and moderate customer feedback — only approved reviews are publicly displayed on the storefront."
      />

      {/* 4 Metric Overview KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <AdminCard
          padding="sm"
          className={`flex flex-col justify-between p-4.5 cursor-pointer transition-all hover:-translate-y-0.5 ${
            stats.pending > 0
              ? "border-amber-500/40 bg-amber-500/5 shadow-xs"
              : "border-line bg-ink"
          }`}
          onClick={() => handleStatusFilterChange("PENDING")}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Pending Verification
            </span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2.5">
            <span className="font-display text-2xl font-bold text-amber-950">
              {stats.pending}
            </span>
            <p className="mt-0.5 text-[11px] text-amber-800">
              {stats.pending > 0
                ? "Awaiting your approval to publish"
                : "All submitted reviews cleared"}
            </p>
          </div>
        </AdminCard>

        {/* Approved Card */}
        <AdminCard
          padding="sm"
          className="flex flex-col justify-between p-4.5 cursor-pointer transition-all hover:-translate-y-0.5 border-line bg-ink"
          onClick={() => handleStatusFilterChange("APPROVED")}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Live on Storefront
            </span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2.5">
            <span className="font-display text-2xl font-bold text-emerald-950">
              {stats.approved}
            </span>
            <p className="mt-0.5 text-[11px] text-emerald-700">
              Verified &amp; visible to buyers
            </p>
          </div>
        </AdminCard>

        {/* Rejected Card */}
        <AdminCard
          padding="sm"
          className="flex flex-col justify-between p-4.5 cursor-pointer transition-all hover:-translate-y-0.5 border-line bg-ink"
          onClick={() => handleStatusFilterChange("REJECTED")}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Rejected / Hidden
            </span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="mt-2.5">
            <span className="font-display text-2xl font-bold text-rose-950">
              {stats.rejected}
            </span>
            <p className="mt-0.5 text-[11px] text-rose-700">
              Filtered out from public view
            </p>
          </div>
        </AdminCard>

        {/* Quality Card */}
        <AdminCard
          padding="sm"
          className="flex flex-col justify-between p-4.5 border-line bg-ink"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-paper-muted">
              Average Rating
            </span>
            <span className={avgRating ? "text-gold" : "text-paper-muted/30"}>★</span>
          </div>
          <div className="mt-2.5">
            {avgRating ? (
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold text-paper">
                  {avgRating}
                </span>
                <span className="text-xs text-paper-muted">/ 5.0</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold text-paper-muted">
                  —
                </span>
                <span className="text-xs text-paper-muted">N/A</span>
              </div>
            )}
            <p className="mt-0.5 text-[11px] text-paper-muted">
              {stats.total > 0
                ? `From ${stats.total} total submissions`
                : "No customer reviews yet"}
            </p>
          </div>
        </AdminCard>
      </section>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-ink-2/60 p-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleStatusFilterChange("ALL")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "ALL"
                ? "bg-ink shadow-sm text-gold border border-gold/30"
                : "text-paper-muted hover:text-paper"
            }`}
          >
            <span>All Reviews</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                statusFilter === "ALL" ? "bg-gold/15 text-gold" : "bg-ink-3 text-paper-muted"
              }`}
            >
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange("PENDING")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "PENDING"
                ? "bg-amber-500/15 text-amber-900 border border-amber-500/40 shadow-sm"
                : "text-paper-muted hover:text-amber-800"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span>Pending Verification</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                statusFilter === "PENDING"
                  ? "bg-amber-500/25 text-amber-950"
                  : "bg-ink-3 text-paper-muted"
              }`}
            >
              {stats.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange("APPROVED")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "APPROVED"
                ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/40 shadow-sm"
                : "text-paper-muted hover:text-emerald-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Approved (Live)</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                statusFilter === "APPROVED"
                  ? "bg-emerald-500/25 text-emerald-900"
                  : "bg-ink-3 text-paper-muted"
              }`}
            >
              {stats.approved}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilterChange("REJECTED")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              statusFilter === "REJECTED"
                ? "bg-rose-500/15 text-rose-900 border border-rose-500/40 shadow-sm"
                : "text-paper-muted hover:text-rose-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Rejected</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                statusFilter === "REJECTED"
                  ? "bg-rose-500/25 text-rose-950"
                  : "bg-ink-3 text-paper-muted"
              }`}
            >
              {stats.rejected}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Search product, customer, text…"
              label="Search reviews"
            />
          </div>
          <span className="text-[12px] text-paper-muted whitespace-nowrap">
            {filtered.length} shown
          </span>
        </div>
      </div>

      {/* Main Table or State */}
      {!isOnline && reviews.length === 0 ? (
        <OfflineState onRetry={() => void reviewsQuery.refetch()} />
      ) : isLoading ? (
        <AdminTableSkeleton />
      ) : reviewsQuery.isError ? (
        <ErrorState
          message="We couldn’t load the review queue."
          onRetry={() => void reviewsQuery.refetch()}
        />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No customer reviews submitted yet"
          description="Customer reviews submitted from the storefront will appear here for verification before publishing."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          emptyLabel={
            statusFilter === "PENDING"
              ? "All clear! There are no pending reviews awaiting verification."
              : statusFilter === "APPROVED"
              ? "No approved reviews found."
              : statusFilter === "REJECTED"
              ? "No rejected reviews."
              : "No reviews match your search."
          }
        />
      )}

      {/* Review Details & Inspection Modal */}
      <ReviewDetailsModal
        review={activeReview}
        open={activeReview !== null}
        onClose={() => setActiveReview(null)}
        onModerate={async (id, status) => {
          if (activeReview) {
            await handleQuickModerate(activeReview, status);
          }
        }}
        onDelete={async (id) => {
          await handleDelete(id);
        }}
      />
    </div>
  );
}
