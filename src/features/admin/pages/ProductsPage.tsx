"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  useAdminProducts,
  useCreateAdminProduct,
  useUpdateAdminProduct,
  useToggleAdminProductStatus,
  useDeleteAdminProduct,
  useAdminCategories,
} from "@/services/admin";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import type { Category, Product } from "@/features/product/types";
import ActionButton from "../components/ActionButton";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable, { type Column } from "../components/DataTable";
import ProductFormModal, {
  type FormValues,
} from "../components/ProductFormModal";
import ProductReviewsModal from "../components/ProductReviewsModal";
import SearchField from "../components/SearchField";
import StatusPill from "../components/StatusPill";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

type ProductStatusFilter = "all" | "active" | "inactive";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function ProductsPage() {
  const productsQuery = useAdminProducts();
  const categoriesQuery = useAdminCategories();
  const { data: products = [], isLoading: productsLoading } = productsQuery;
  const { data: categories = [], isLoading: categoriesLoading } = categoriesQuery;
  const isOnline = useOnlineStatus();
  const createMutation = useCreateAdminProduct();
  const updateMutation = useUpdateAdminProduct();
  const toggleStatusMutation = useToggleAdminProductStatus();
  const deleteMutation = useDeleteAdminProduct();

  const isLoading = productsLoading || categoriesLoading;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [duplicating, setDuplicating] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  const openReviews = (product: Product) => {
    setSelectedProductForReviews(product);
    setReviewsModalOpen(true);
  };


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesQuery = !q || product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [products, query, statusFilter]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setDuplicating(null);
    setEditing(product);
    setFormOpen(true);
  };

  const openDuplicate = (product: Product) => {
    setEditing(null);
    setDuplicating(product);
    setFormOpen(true);
  };

  const handleSubmit = (values: FormValues) => {
    if (editing && !duplicating) {
      updateMutation.mutate({
        id: editing.id,
        patch: {
          name: values.name,
          price: values.price,
          description: values.description,
          category: values.category as Category,
          size: values.size,
          color: values.color,
          images: values.images,
          image: values.image,
          status: values.status,
        },
      });
    } else {
      createMutation.mutate({
        name: values.name,
        price: values.price,
        description: values.description,
        category: values.category as Category,
        size: values.size,
        color: values.color,
        images: values.images,
        image: values.image,
        status: values.status,
      });
    }
    setFormOpen(false);
    setEditing(null);
    setDuplicating(null);
  };

  const deletingProduct = deletingId
    ? products.find((p) => p.id === deletingId) ?? null
    : null;

  const columns: Column<Product>[] = [
    {
      key: "image",
      label: "Image",
      width: "w-20",
      render: (p) => (
        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-line bg-ink-2">
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-medium text-paper">{p.name}</span>
          <span className="text-[11.5px] text-paper-muted">{p.id}</span>
        </div>
      ),
    },
    {
      key: "inventory",
      label: "Inventory",
      render: (p) => {
        const total = p.variants.reduce((sum, variant) => sum + variant.inventory.available, 0);
        const low = p.variants.filter((variant) => variant.inventory.available <= 5).length;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-paper">{p.variants.length} variants · {total} stock</span>
            <span className={low ? "text-[11px] text-[#B3261E]" : "text-[11px] text-[#16A34A]"}>{low ? low + " low-stock" : "All healthy"}</span>
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Price",
      render: (p) => (
        <span className="font-semibold text-gold">{formatPrice(p.price)}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (p) => {
        const rating = typeof p.rating === "number" ? p.rating : 0;
        const count = Array.isArray(p.reviews) ? p.reviews.length : 0;
        return (
          <button
            type="button"
            onClick={() => openReviews(p)}
            className="group flex flex-col items-start text-left transition-colors"
            title="Click to view all reviews"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">★</span>
              <span className="font-semibold text-paper group-hover:text-gold">
                {count > 0 ? rating.toFixed(1) : "—"}
              </span>
              <span className="text-[11px] text-paper-muted">
                ({count})
              </span>
            </div>
            {count > 0 ? (
              <span className="text-[10px] text-gold/80 group-hover:underline">
                View reviews
              </span>
            ) : (
              <span className="text-[10px] text-paper-muted">
                No reviews
              </span>
            )}
          </button>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      render: (p) => <span className="text-paper-muted">{p.category}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (p) => <StatusPill active={p.status === "active"} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (p) => {
        const active = p.status === "active";
        return (
          <div className="flex items-center justify-end gap-2">
            <ActionButton onClick={() => openReviews(p)}>
              Reviews ({Array.isArray(p.reviews) ? p.reviews.length : 0})
            </ActionButton>
            <ActionButton
              tone={active ? "warning" : "success"}
              onClick={() => toggleStatusMutation.mutate(p.id)}
            >
              {active ? "Deactivate" : "Activate"}
            </ActionButton>
            <ActionButton onClick={() => openEdit(p)}>Edit</ActionButton>
            <ActionButton onClick={() => openDuplicate(p)}>Duplicate</ActionButton>
            <ActionButton tone="danger" onClick={() => setDeletingId(p.id)}>
              Delete
            </ActionButton>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Catalog"
        title="Products"
        description="Create, update, and toggle storefront visibility. Inactive products stay in admin but are hidden from shoppers."
        action={
          <Button variant="primary" size="sm" onClick={openAdd}>
            <PlusIcon />
            Add product
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:max-w-xs">
            <SearchField value={query} onChange={setQuery} placeholder="Search products…" label="Search products" />
          </div>
          <span className="text-[12px] text-paper-muted">{filtered.length} of {products.length}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-label="Filter products by status">
          {(["all", "active", "inactive"] as const).map((status) => (
            <button key={status} type="button" onClick={() => setStatusFilter(status)} aria-pressed={statusFilter === status} className={statusFilter === status ? "rounded-full border border-gold bg-gold px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink" : "rounded-full border border-line px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-muted hover:border-gold hover:text-gold"}>
              {status === "all" ? "All products" : status === "active" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
      </div>

      {!isOnline && products.length === 0 ? (
        <OfflineState onRetry={() => { void productsQuery.refetch(); void categoriesQuery.refetch(); }} />
      ) : isLoading ? (
        <AdminTableSkeleton />
      ) : productsQuery.isError || categoriesQuery.isError ? (
        <ErrorState message="We couldn’t load the product catalog." onRetry={() => { void productsQuery.refetch(); void categoriesQuery.refetch(); }} />
      ) : products.length === 0 ? (
        <EmptyState title="No products yet" description="Create your first product to start building the catalog." />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(p) => p.id}
          emptyLabel="No products match your search."
        />
      )}

      {[createMutation, updateMutation, toggleStatusMutation, deleteMutation].some((mutation) => mutation.isError) ? (
        <ErrorState className="min-h-0 py-6" title="Change not saved" message="Please try that action again." />
      ) : null}

      <ProductFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setDuplicating(null);
        }}
        onSubmit={handleSubmit}
        initial={duplicating ?? editing}
        duplicate={Boolean(duplicating)}
        categories={categories}
      />

      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Delete product"
        description={`This removes "${deletingProduct?.name ?? "the product"}" from admin and the storefront. You can't undo this in-session.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (deletingId) deleteMutation.mutate(deletingId);
          setDeletingId(null);
        }}
      />

      <ProductReviewsModal
        product={selectedProductForReviews}
        open={reviewsModalOpen}
        onClose={() => {
          setReviewsModalOpen(false);
          setSelectedProductForReviews(null);
        }}
      />
    </div>
  );
}
