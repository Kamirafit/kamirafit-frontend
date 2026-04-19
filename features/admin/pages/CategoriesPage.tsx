"use client";

import { useState } from "react";
import type { AdminCategory } from "@/data/categories";
import {
  addCategory,
  deleteCategory,
  updateCategory,
} from "@/features/admin/store/categoriesSlice";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import AdminPageHeader from "../components/AdminPageHeader";
import CategoryFormModal from "../components/CategoryFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.adminCategories.items);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletingCategory = deletingId
    ? categories.find((c) => c.id === deletingId) ?? null
    : null;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Taxonomy"
        title="Categories"
        description="Organize the catalog. Each category groups subcategories used when creating or editing products."
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 ease-in-out hover:bg-gold-bright hover:shadow-[0_10px_24px_-10px_rgba(74,14,26,0.55)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add category
          </button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-line bg-ink">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-left text-[13px]">
            <thead className="bg-ink-2/60 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">
              <tr>
                <th className="px-4 py-3">Category name</th>
                <th className="px-4 py-3">Subcategories</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-paper">
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-ink-2/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-paper">{c.name}</span>
                      <span className="text-[11.5px] text-paper-muted">
                        {c.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {c.subcategories.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-full border border-line bg-ink-2 px-2.5 py-0.5 text-[11.5px] text-paper"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(c);
                          setFormOpen(true);
                        }}
                        className="rounded-md border border-line px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-paper transition-all duration-200 hover:border-gold hover:text-gold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(c.id)}
                        className="rounded-md border border-line px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-paper-muted transition-all duration-200 hover:border-[#B3261E] hover:text-[#B3261E]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-paper-muted">
                    No categories yet — add one to get started.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={(values) => {
          if (editing) {
            dispatch(updateCategory({ id: editing.id, patch: values }));
          } else {
            dispatch(addCategory(values));
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
          if (deletingId) dispatch(deleteCategory(deletingId));
          setDeletingId(null);
        }}
      />
    </div>
  );
}
