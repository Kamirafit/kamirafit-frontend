"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  type Category,
  type Color,
  type Product,
  type ProductStatus,
  type Size,
} from "@/features/product/types";
import Button from "@/components/ui/Button";
import FormField, { inputClass, textareaClass } from "./FormField";
import Modal from "./Modal";
import MultiSelectChips from "./MultiSelectChips";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
  initial?: Product | null;
  categoryOptions?: string[];
};

export type FormValues = {
  name: string;
  price: number;
  description: string;
  category: Category;
  size: Size[];
  color: Color[];
  images: string[];
  image: string;
  status: ProductStatus;
};

const EMPTY: FormValues = {
  name: "",
  price: 0,
  description: "",
  category: "Regular",
  size: [],
  color: [],
  images: [],
  image: "",
  status: "active",
};

function isCategory(v: string, options: string[]): v is Category {
  return options.includes(v) && CATEGORY_OPTIONS.includes(v as Category);
}

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  categoryOptions,
}: Props) {
  const effectiveCategories = useMemo(
    () =>
      categoryOptions && categoryOptions.length > 0
        ? categoryOptions.filter((c): c is Category =>
            (CATEGORY_OPTIONS as readonly string[]).includes(c),
          )
        : [...CATEGORY_OPTIONS],
    [categoryOptions],
  );

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [imagesText, setImagesText] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        name: initial.name,
        price: initial.price,
        description: initial.description,
        category: initial.category,
        size: initial.size,
        color: initial.color,
        images: initial.images,
        image: initial.image,
        status: initial.status,
      });
      setImagesText(initial.images.join("\n"));
    } else {
      setValues({ ...EMPTY, category: effectiveCategories[0] ?? "Regular" });
      setImagesText("");
    }
    setErrors({});
  }, [open, initial, effectiveCategories]);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedImages = imagesText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    if (!values.name.trim()) nextErrors.name = "Name is required";
    if (!(values.price > 0)) nextErrors.price = "Price must be greater than 0";
    if (!values.description.trim())
      nextErrors.description = "Description is required";
    if (parsedImages.length === 0)
      nextErrors.images = "Provide at least one image URL";
    if (values.size.length === 0)
      nextErrors.size = "Pick at least one size";
    if (values.color.length === 0)
      nextErrors.color = "Pick at least one color";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      ...values,
      images: parsedImages,
      image: parsedImages[0],
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit product" : "Add product"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Name" error={errors.name}>
            <input
              type="text"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder="Ivory Oversized Tee"
            />
          </FormField>
          <FormField label="Price (₹)" error={errors.price}>
            <input
              type="number"
              min={0}
              value={values.price}
              onChange={(e) => set("price", Number(e.target.value))}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="Description" error={errors.description}>
          <textarea
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className={textareaClass}
            placeholder="Fabric, fit, feel — in a sentence or two."
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Category">
            <select
              value={values.category}
              onChange={(e) => {
                const next = e.target.value;
                if (isCategory(next, effectiveCategories)) {
                  set("category", next);
                }
              }}
              className={inputClass}
            >
              {effectiveCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Status">
            <div className="flex gap-2">
              {(["active", "inactive"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => set("status", s)}
                  className={`flex-1 rounded-full border px-4 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                    values.status === s
                      ? s === "active"
                        ? "border-[#16A34A] bg-[#16A34A]/10 text-[#16A34A]"
                        : "border-[#B3261E] bg-[#B3261E]/10 text-[#B3261E]"
                      : "border-line text-paper-muted hover:border-gold hover:text-paper"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        <FormField label="Sizes" error={errors.size}>
          <MultiSelectChips
            options={SIZE_OPTIONS}
            value={values.size}
            onChange={(v) => set("size", v)}
          />
        </FormField>

        <FormField label="Colors" error={errors.color}>
          <MultiSelectChips
            options={COLOR_OPTIONS}
            value={values.color}
            onChange={(v) => set("color", v)}
          />
        </FormField>

        <FormField
          label="Image URLs"
          hint="One URL per line. The first URL is used as the card thumbnail."
          error={errors.images}
        >
          <textarea
            value={imagesText}
            onChange={(e) => setImagesText(e.target.value)}
            className={textareaClass}
            placeholder="https://images.unsplash.com/…"
          />
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-3">
          <Button variant="dark" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {initial ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
