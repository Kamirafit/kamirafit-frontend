"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
import FormField, { inputClass, selectClass, textareaClass } from "./FormField";
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

const MAX_IMAGE_URLS = 8;

function isCategory(v: string, options: string[]): v is Category {
  return options.includes(v) && CATEGORY_OPTIONS.includes(v as Category);
}

function parseImageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeImageSource(value: string): string | null {
  if (value.startsWith("blob:")) return value;
  return parseImageUrl(value);
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
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  // Object URLs we've minted via `URL.createObjectURL` during the lifetime of
  // the modal — revoked on close / cleanup so we don't leak blob refs.
  const objectUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    } else {
      setValues({ ...EMPTY, category: effectiveCategories[0] ?? "Regular" });
    }
    setErrors({});
  }, [open, initial, effectiveCategories]);

  // Revoke any pending object URLs when the modal closes or unmounts so we
  // don't leak references into memory. New previews are minted on each open.
  useEffect(() => {
    if (open) return;
    objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsRef.current = [];
  }, [open]);
  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
    },
    [],
  );

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      added.push(url);
    }
    if (added.length === 0) return;
    setValues((prev) => ({
      ...prev,
      images: [...prev.images, ...added],
      image: prev.image || added[0],
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImageAt = (idx: number) => {
    setValues((prev) => {
      const removed = prev.images[idx];
      const images = prev.images.filter((_, i) => i !== idx);
      // If we dropped a blob URL, revoke it immediately.
      if (removed && removed.startsWith("blob:")) {
        URL.revokeObjectURL(removed);
        objectUrlsRef.current = objectUrlsRef.current.filter(
          (u) => u !== removed,
        );
      }
      const image =
        prev.image === removed ? images[0] ?? "" : prev.image;
      return { ...prev, images, image };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedImages = values.images
      .map(normalizeImageSource)
      .filter((url): url is string => Boolean(url));
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};
    const name = values.name.trim();
    const description = values.description.trim();
    if (!name) nextErrors.name = "Name is required";
    if (name.length > 80) nextErrors.name = "Name must stay under 80 characters";
    if (!(values.price > 0) || values.price > 500000)
      nextErrors.price = "Enter a realistic product price";
    if (!values.description.trim())
      nextErrors.description = "Description is required";
    if (description.length > 600)
      nextErrors.description = "Description must stay under 600 characters";
    if (parsedImages.length === 0)
      nextErrors.images = "Upload at least one image or use a secure HTTPS image URL";
    if (parsedImages.length !== values.images.length)
      nextErrors.images = "Remote image URLs must use HTTPS";
    if (parsedImages.length > MAX_IMAGE_URLS)
      nextErrors.images = `Use ${MAX_IMAGE_URLS} image URLs or fewer`;
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
      name,
      description,
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
              maxLength={80}
              className={inputClass}
              placeholder="Ivory Oversized Tee"
            />
          </FormField>
          <FormField label="Price (₹)" error={errors.price}>
            <input
              type="number"
              min={0}
              max={500000}
              step={1}
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
            maxLength={600}
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
              className={selectClass}
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
          label="Product images"
          hint="Upload image files now. When the backend is ready, serve product images from your configured HTTPS media host."
          error={errors.images}
        >
          <div className="flex flex-col gap-3">
            <label
              htmlFor="product-images-upload"
              className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-ink-2/40 px-4 py-4 text-[13px] text-paper-muted transition-colors hover:border-gold hover:text-paper"
            >
              <span>
                <span className="font-semibold text-paper group-hover:text-gold">
                  Click to upload
                </span>{" "}
                or drop image files here
              </span>
              <span className="rounded-full border border-line px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted group-hover:border-gold group-hover:text-gold">
                Browse
              </span>
            </label>
            <input
              ref={fileInputRef}
              id="product-images-upload"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            {values.images.length > 0 && (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {values.images.map((src, idx) => (
                  <li
                    key={`${src}-${idx}`}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-ink-2"
                  >
                    <Image
                      src={src}
                      alt={`Upload ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                      unoptimized={src.startsWith("blob:")}
                    />
                    {idx === 0 && (
                      <span className="absolute left-1 top-1 rounded-full bg-gold px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-paper">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImageAt(idx)}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-line bg-ink/80 text-[11px] text-paper-muted opacity-0 backdrop-blur-sm transition-all duration-200 hover:border-[#B3261E] hover:text-[#B3261E] group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
