"use client";

import { useEffect, useState } from "react";
import type { AdminCategory } from "@/data/categories";
import FormField, { inputClass } from "./FormField";
import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<AdminCategory, "id">) => void;
  initial: AdminCategory | null;
};

const EMPTY: Omit<AdminCategory, "id"> = { name: "", subcategories: [] };

export default function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}: Props) {
  const [values, setValues] = useState<Omit<AdminCategory, "id">>(EMPTY);
  const [subInput, setSubInput] = useState("");
  const [errors, setErrors] = useState<{ name?: string; subcategories?: string }>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({ name: initial.name, subcategories: initial.subcategories });
    } else {
      setValues(EMPTY);
    }
    setSubInput("");
    setErrors({});
  }, [open, initial]);

  const addSubcategory = () => {
    const raw = subInput.trim();
    if (!raw) return;
    if (values.subcategories.includes(raw)) {
      setSubInput("");
      return;
    }
    setValues((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, raw],
    }));
    setSubInput("");
  };

  const removeSubcategory = (name: string) => {
    setValues((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== name),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.name.trim()) nextErrors.name = "Name is required";
    if (values.subcategories.length === 0)
      nextErrors.subcategories = "Add at least one subcategory";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit category" : "Add category"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="Category name" error={errors.name}>
          <input
            type="text"
            value={values.name}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, name: e.target.value }))
            }
            className={inputClass}
            placeholder="Oversized"
          />
        </FormField>

        <FormField
          label="Subcategories"
          hint="Press Enter or click Add to append. Use chips to remove."
          error={errors.subcategories}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={subInput}
              onChange={(e) => setSubInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubcategory();
                }
              }}
              className={inputClass}
              placeholder="Tees"
            />
            <button
              type="button"
              onClick={addSubcategory}
              className="shrink-0 rounded-lg border border-gold px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold transition-all duration-200 hover:bg-gold hover:text-white"
            >
              Add
            </button>
          </div>
          {values.subcategories.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {values.subcategories.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ink-2 px-3 py-1 text-[12px] text-paper"
                >
                  {s}
                  <button
                    type="button"
                    aria-label={`Remove ${s}`}
                    onClick={() => removeSubcategory(s)}
                    className="text-paper-muted transition-colors hover:text-[#B3261E]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line bg-transparent px-4 py-2 text-[12.5px] font-medium text-paper transition-colors hover:bg-ink-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-gold px-4 py-2 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 ease-in-out hover:bg-gold-bright hover:shadow-[0_10px_24px_-10px_rgba(74,14,26,0.55)]"
          >
            {initial ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
