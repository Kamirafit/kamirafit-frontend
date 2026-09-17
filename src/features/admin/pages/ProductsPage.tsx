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
import TableActions from "../components/TableActions";
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

  const isLoading = productsLoading || categoriesLoading || productsQuery.isFetching || categoriesQuery.isFetching;

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
    setDuplicating(null);
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
    const payload = {
      name: values.name,
      price: values.price,
      costPrice: values.costPrice,
      mrp: values.mrp || values.price,
      basePrice: values.price,
      baseMrp: values.mrp || values.price,
      description: values.description,
      category: values.category as Category,
      categoryId: values.categoryId,
      subcategory: values.subcategory,
      size: values.size,
      color: values.color,
      images: values.images,
      imageColorMap: values.imageColorMap || {},
      image: values.image,
      status: values.status,
      isFeatured: values.isFeatured,
      slug: values.slug,
      variants: values.variants,
    };

    if (editing && !duplicating) {
      updateMutation.mutate(
        {
          id: editing.id,
          patch: payload,
        },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditing(null);
            setDuplicating(null);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setFormOpen(false);
          setEditing(null);
          setDuplicating(null);
        },
      });
    }
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
      render: (p) => {
        const mrp = typeof p.mrp === "number" ? p.mrp : typeof p.baseMrp === "number" ? p.baseMrp : 0;
        const price = typeof p.price === "number" ? p.price : 0;
        const hasDiscount = mrp > 0 && price > 0 && mrp > price;
        const discountPercent = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

        return (
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              {hasDiscount ? (
                <span className="line-through text-paper-muted text-[11px]">{formatPrice(mrp)}</span>
              ) : null}
              <span className="font-semibold text-gold">{formatPrice(price > 0 ? price : mrp)}</span>
            </div>
            {hasDiscount ? (
              <span className="text-[10.5px] font-bold text-gold">
                {discountPercent}% OFF
              </span>
            ) : null}
          </div>
        );
      },
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
        const reviewsCount = Array.isArray(p.reviews) ? p.reviews.length : 0;
        return (
          <TableActions
            actions={[
              {
                label: `Reviews (${reviewsCount})`,
                onClick: () => openReviews(p),
                icon: (
                  <svg className="h-3.5 w-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ),
              },
              {
                label: active ? "Deactivate" : "Activate",
                tone: active ? "warning" : "success",
                onClick: () => toggleStatusMutation.mutate(p.id),
                icon: active ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ),
              },
              {
                label: "Edit",
                onClick: () => openEdit(p),
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                ),
              },
              {
                label: "Duplicate",
                onClick: () => openDuplicate(p),
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                label: "Delete",
                tone: "danger",
                onClick: () => setDeletingId(p.id),
                icon: (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ),
              },
            ]}
          />
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
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Delete product"
        description={`This removes "${deletingProduct?.name ?? "the product"}" from admin and the storefront. You can't undo this in-session.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deletingId) {
            deleteMutation.mutate(deletingId, {
              onSuccess: () => {
                setDeletingId(null);
              },
            });
          }
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
