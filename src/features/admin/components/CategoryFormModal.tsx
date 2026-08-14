"use client";

import { useEffect, useState } from "react";
import type { AdminCategory } from "@/types/entities";
import Button from "@/components/ui/Button";
import FormField, { inputClass } from "./FormField";
import Modal from "./Modal";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<AdminCategory, "id">) => void;
  initial: AdminCategory | null;
};

const EMPTY: Omit<AdminCategory, "id"> = { name: "", description: "", subcategories: [] };

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
      setValues({ name: initial.name, description: initial.description || "", subcategories: initial.subcategories });
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
    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
    });
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
            placeholder="Indian Wear"
          />
        </FormField>

        <FormField label="Description (Optional)">
          <input
            type="text"
            value={values.description || ""}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, description: e.target.value }))
            }
            className={inputClass}
            placeholder="Traditional & Festive Collection"
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
            <Button
              variant="secondary"
              size="sm"
              onClick={addSubcategory}
              className="shrink-0"
            >
              Add
            </Button>
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

        <div className="flex items-center justify-end gap-2 pt-3">
          <Button variant="dark" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {initial ? "Save changes" : "Create category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
