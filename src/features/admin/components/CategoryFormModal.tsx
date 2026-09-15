"use client";

import { useEffect, useRef, useState } from "react";
import type { AdminCategory } from "@/types/entities";
import Image from "next/image";
import Button from "@/components/ui/Button";
import FormField, { inputClass } from "./FormField";
import Modal from "./Modal";
import { compressImageToDataUrl } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<AdminCategory, "id">) => void;
  initial: AdminCategory | null;
  loading?: boolean;
};

const EMPTY: Omit<AdminCategory, "id"> = {
  name: "",
  description: "",
  image: "",
  subcategories: [],
};

export default function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading = false,
}: Props) {
  const [values, setValues] = useState<Omit<AdminCategory, "id">>(EMPTY);
  const [subInput, setSubInput] = useState("");
  const [errors, setErrors] = useState<{ name?: string; subcategories?: string; image?: string }>({});
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        name: initial.name,
        description: initial.description || "",
        image: initial.image || "",
        subcategories: initial.subcategories || [],
      });
      setUrlDraft(initial.image || "");
    } else {
      setValues(EMPTY);
      setUrlDraft("");
    }
    setSubInput("");
    setErrors({});
    setShowUrlInput(false);
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
    setErrors((prev) => ({ ...prev, subcategories: undefined }));
  };

  const removeSubcategory = (name: string) => {
    setValues((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== name),
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select a valid image file (JPG, PNG, WebP)." }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be under 10MB." }));
      return;
    }

    setIsProcessingImage(true);
    setErrors((prev) => ({ ...prev, image: undefined }));

    try {
      const dataUrl = await compressImageToDataUrl(file, 1000, 1200, 0.82);
      setValues((prev) => ({ ...prev, image: dataUrl }));
    } catch {
      setErrors((prev) => ({ ...prev, image: "Failed to process image. Please try another image." }));
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyUrl = () => {
    const clean = urlDraft.trim();
    if (!clean) return;
    if (!clean.startsWith("http://") && !clean.startsWith("https://") && !clean.startsWith("data:image/")) {
      setErrors((prev) => ({ ...prev, image: "Please enter a valid HTTP, HTTPS, or data image URL." }));
      return;
    }
    setValues((prev) => ({ ...prev, image: clean }));
    setShowUrlInput(false);
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleRemoveImage = () => {
    setValues((prev) => ({ ...prev, image: "" }));
    setUrlDraft("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      image: values.image?.trim() || undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={initial ? "Edit category" : "Add category"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

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

        {/* ---------------- CATEGORY IMAGE UPLOAD ---------------- */}
        <FormField
          label="Category Image"
          hint="One image displayed on the storefront category grid (recommended 800×1000px portrait)."
          error={errors.image}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {values.image ? (
            /* Selected Image Preview */
            <div className="relative flex items-center gap-4 rounded-xl border border-line bg-ink-2 p-3">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-ink shadow-sm">
                <Image
                  src={values.image}
                  alt={values.name || "Category preview"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <p className="text-xs font-semibold text-paper truncate">
                  {values.name || "Category image"}
                </p>
                <p className="text-[11px] text-emerald-400 font-medium">
                  ✓ Image attached
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingImage || loading}
                    className="!py-1 !px-2.5 !text-xs"
                  >
                    Change
                  </Button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={loading}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Dropzone / Trigger */
            <div className="flex flex-col gap-2.5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line p-6 text-center transition-colors hover:border-gold/60 hover:bg-gold/5 cursor-pointer"
              >
                <span className="mb-2 text-2xl text-paper-muted group-hover:text-gold transition-colors">
                  📷
                </span>
                <p className="text-xs font-semibold text-paper group-hover:text-gold transition-colors">
                  {isProcessingImage ? "Optimizing image…" : "Upload Category Image"}
                </p>
                <p className="mt-1 text-[11px] text-paper-muted">
                  Click to browse from your device (WebP, JPG, PNG up to 10MB)
                </p>
              </div>

              {/* Alternative: Enter URL */}
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-left text-[11px] text-gold hover:underline transition-colors w-fit cursor-pointer"
                >
                  + Or enter image URL directly
                </button>
              ) : (
                <div className="flex gap-2 animate-fadeIn">
                  <input
                    type="url"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={inputClass}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyUrl}
                    className="shrink-0"
                  >
                    Set URL
                  </Button>
                  <Button
                    type="button"
                    variant="dark"
                    size="sm"
                    onClick={() => setShowUrlInput(false)}
                    className="shrink-0"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
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
          <Button variant="dark" size="sm" onClick={onClose} disabled={loading || isProcessingImage}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            loading={loading || isProcessingImage}
            disabled={loading || isProcessingImage}
          >
            {initial ? "Save changes" : "Create category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

