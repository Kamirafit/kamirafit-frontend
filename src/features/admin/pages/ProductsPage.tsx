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
import SearchField from "../components/SearchField";
import StatusPill from "../components/StatusPill";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

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
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => categories.map((c) => c.name),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleSubmit = (values: FormValues) => {
    if (editing) {
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
      key: "price",
      label: "Price",
      render: (p) => (
        <span className="font-semibold text-gold">{formatPrice(p.price)}</span>
      ),
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
            <ActionButton
              tone={active ? "warning" : "success"}
              onClick={() => toggleStatusMutation.mutate(p.id)}
            >
              {active ? "Deactivate" : "Activate"}
            </ActionButton>
            <ActionButton onClick={() => openEdit(p)}>Edit</ActionButton>
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

      <div className="flex items-center gap-3">
        <div className="w-full sm:max-w-xs">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search products…"
            label="Search products"
          />
        </div>
        <span className="text-[12px] text-paper-muted">
          {filtered.length} of {products.length}
        </span>
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
        }}
        onSubmit={handleSubmit}
        initial={editing}
        categoryOptions={categoryOptions}
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
    </div>
  );
}
