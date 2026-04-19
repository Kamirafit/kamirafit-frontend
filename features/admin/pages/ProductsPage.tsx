"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  addProduct,
  deleteProduct,
  toggleProductStatus,
  updateProduct,
} from "@/features/admin/store/productsSlice";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import type { Category, Product } from "@/features/product/types";
import AdminPageHeader from "../components/AdminPageHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import ProductFormModal, {
  type FormValues,
} from "../components/ProductFormModal";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${
        active
          ? "border-[#16A34A]/40 bg-[#16A34A]/10 text-[#16A34A]"
          : "border-[#B3261E]/40 bg-[#B3261E]/10 text-[#B3261E]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[#16A34A]" : "bg-[#B3261E]"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.adminProducts.items);
  const categories = useAppSelector((s) => s.adminCategories.items);

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
      dispatch(
        updateProduct({
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
        }),
      );
    } else {
      dispatch(
        addProduct({
          name: values.name,
          price: values.price,
          description: values.description,
          category: values.category as Category,
          size: values.size,
          color: values.color,
          images: values.images,
          image: values.image,
          status: values.status,
        }),
      );
    }
    setFormOpen(false);
    setEditing(null);
  };

  const deletingProduct = deletingId
    ? products.find((p) => p.id === deletingId) ?? null
    : null;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Create, update, and toggle storefront visibility. Inactive products stay in admin but are hidden from shoppers."
        action={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 ease-in-out hover:bg-gold-bright hover:shadow-[0_10px_24px_-10px_rgba(74,14,26,0.55)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add product
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-lg border border-line bg-ink-2 px-3 py-2 pl-9 text-[13px] text-paper placeholder:text-paper-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>
        <span className="text-[12px] text-paper-muted">
          {filtered.length} of {products.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-ink">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-left text-[13px]">
            <thead className="bg-ink-2/60 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-paper">
              {filtered.map((p) => {
                const active = p.status === "active";
                return (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-ink-2/60"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border border-line bg-ink-2">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-paper">{p.name}</span>
                        <span className="text-[11.5px] text-paper-muted">
                          {p.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gold">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3 text-paper-muted">{p.category}</td>
                    <td className="px-4 py-3">
                      <StatusPill active={active} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => dispatch(toggleProductStatus(p.id))}
                          className={`rounded-md border px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${
                            active
                              ? "border-[#B3261E]/40 text-[#B3261E] hover:bg-[#B3261E]/10"
                              : "border-[#16A34A]/40 text-[#16A34A] hover:bg-[#16A34A]/10"
                          }`}
                        >
                          {active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="rounded-md border border-line px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-paper transition-all duration-200 hover:border-gold hover:text-gold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(p.id)}
                          className="rounded-md border border-line px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-paper-muted transition-all duration-200 hover:border-[#B3261E] hover:text-[#B3261E]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-paper-muted">
                    No products match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

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
          if (deletingId) dispatch(deleteProduct(deletingId));
          setDeletingId(null);
        }}
      />
    </div>
  );
}
