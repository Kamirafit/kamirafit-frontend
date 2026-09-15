"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import type { AdminCategory } from "@/types/entities";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
} from "@/services/admin";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import ActionButton from "../components/ActionButton";
import CategoryFormModal from "../components/CategoryFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable, { type Column } from "../components/DataTable";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function CategoriesPage() {
  const categoriesQuery = useAdminCategories();
  const { data: categories = [] } = categoriesQuery;
  const isLoading = categoriesQuery.isLoading || (categoriesQuery.isFetching && categories.length === 0);
  const isOnline = useOnlineStatus();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletingCategory = deletingId
    ? categories.find((c: AdminCategory) => c.id === deletingId) ?? null
    : null;

  const columns: Column<AdminCategory>[] = [
    {
      key: "image",
      label: "Image",
      render: (c) => (
        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-ink-2">
          {c.image ? (
            <Image
              src={c.image}
              alt={c.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-paper-muted">
              No img
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Category name",
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-medium text-paper">{c.name}</span>
          {c.description && <span className="text-[11.5px] text-paper-muted">{c.description}</span>}
        </div>
      ),
    },
    {
      key: "subcategories",
      label: "Subcategories",
      render: (c) => (
        <div className="flex flex-wrap gap-1.5">
          {c.subcategories.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-full border border-line bg-ink-2 px-3 py-0.5 text-[11.5px] text-paper"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            onClick={() => {
              setEditing(c);
              setFormOpen(true);
            }}
          >
            Edit
          </ActionButton>
          <ActionButton tone="danger" onClick={() => setDeletingId(c.id)}>
            Delete
          </ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Taxonomy"
        title="Categories"
        description="Organize the catalog. Each category groups subcategories used when creating or editing products."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <PlusIcon />
            Add category
          </Button>
        }
      />

      {!isOnline && categories.length === 0 ? (
        <OfflineState onRetry={() => void categoriesQuery.refetch()} />
      ) : isLoading ? (
        <AdminTableSkeleton />
      ) : categoriesQuery.isError ? (
        <ErrorState message="We couldn’t load categories." onRetry={() => void categoriesQuery.refetch()} />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add a category to organize the product catalog." />
      ) : (
        <DataTable
          columns={columns}
          rows={categories}
          getRowKey={(c) => c.id}
          emptyLabel="No categories yet — add one to get started."
        />
      )}

      {[createMutation, updateMutation, deleteMutation].some((mutation) => mutation.isError) ? <ErrorState className="min-h-0 py-6" title="Category change not saved" message="Please try that action again." /> : null}

      <CategoryFormModal
        open={formOpen}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={(values) => {
          if (editing) {
            updateMutation.mutate(
              { id: editing.id, patch: values },
              {
                onSuccess: () => {
                  setFormOpen(false);
                  setEditing(null);
                },
              }
            );
          } else {
            createMutation.mutate(values, {
              onSuccess: () => {
                setFormOpen(false);
                setEditing(null);
              },
            });
          }
        }}
      />

      <ConfirmDialog
        open={deletingId !== null}
        loading={deleteMutation.isPending}
        onClose={() => setDeletingId(null)}
        title="Delete category"
        description={`Remove "${deletingCategory?.name ?? "the category"}" and its subcategories. Products already using this category are not touched, but you won't be able to pick it on new products.`}
        confirmLabel="Delete"
        danger
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
    </div>
  );
}
