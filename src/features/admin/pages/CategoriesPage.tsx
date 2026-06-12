"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import type { AdminCategory } from "@/data/categories";
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

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useAdminCategories();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletingCategory = deletingId
    ? categories.find((c) => c.id === deletingId) ?? null
    : null;

  const columns: Column<AdminCategory>[] = [
    {
      key: "name",
      label: "Category name",
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-medium text-paper">{c.name}</span>
          <span className="text-[11.5px] text-paper-muted">{c.id}</span>
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

      {isLoading ? (
        <AdminTableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          rows={categories}
          getRowKey={(c) => c.id}
          emptyLabel="No categories yet — add one to get started."
        />
      )}

      <CategoryFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={(values) => {
          if (editing) {
            updateMutation.mutate({ id: editing.id, patch: values });
          } else {
            createMutation.mutate(values);
          }
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Delete category"
        description={`Remove "${deletingCategory?.name ?? "the category"}" and its subcategories. Products already using this category are not touched, but you won't be able to pick it on new products.`}
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
